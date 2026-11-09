import { useMemo } from 'react';
import type { CarCategory } from '../types/CarModel';
import type { Spot } from '../types/Spot';
import {
  buildStickerSlots,
  computeProgress,
  filterSlotsByCategory,
  getOtherSpots,
  type CollectionProgress,
  type StickerSlot,
} from '../utils/collection';
import { useCarModels } from './useCarModels';
import { useMySpots } from './useSpots';

interface StickerBook {
  slots: StickerSlot[];
  progress: CollectionProgress;
  overallProgress: CollectionProgress;
  otherSpots: Spot[];
  totalSpots: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  refresh: () => void;
}

/** Business logic of the sticker book: the catalogue combined with the user's spots. */
export function useStickerBook(category?: CarCategory): StickerBook {
  const carModels = useCarModels();
  const spots = useMySpots();
  const models = carModels.data;
  const mySpots = spots.data;

  const allSlots = useMemo(() => buildStickerSlots(models ?? [], mySpots ?? []), [models, mySpots]);
  const slots = useMemo(() => filterSlotsByCategory(allSlots, category), [allSlots, category]);
  const otherSpots = useMemo(() => getOtherSpots(mySpots ?? []), [mySpots]);

  return {
    slots,
    progress: computeProgress(slots),
    overallProgress: computeProgress(allSlots),
    otherSpots,
    totalSpots: mySpots?.length ?? 0,
    isLoading: carModels.isPending || spots.isPending,
    isRefreshing: carModels.isRefetching || spots.isRefetching,
    isError: carModels.isError || spots.isError,
    refresh: () => {
      void carModels.refetch();
      void spots.refetch();
    },
  };
}
