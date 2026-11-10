import { useMemo } from 'react';
import type { RevealData } from '../types/Progress';
import { revealFor } from '../utils/progression';
import { useCarModels, useCollections } from './useCarModels';
import { useProgress } from './useProgress';
import { useMySpots } from './useSpots';

export interface UseReveal {
  reveal?: RevealData;
  isLoading: boolean;
  /** True once the data is loaded and the spot does not exist (deleted, or a wrong link). */
  isMissing: boolean;
}

/**
 * Everything the sticker reveal of one spot shows, re-derived from the cache (so a refresh or deep
 * link of /reveal/<id> works), including Appendix E set progress and SET COMPLETE.
 */
export function useReveal(spotId?: string): UseReveal {
  const { snapshot, isLoading } = useProgress();
  const { data: spots } = useMySpots();
  const { data: models } = useCarModels();
  const { data: collections } = useCollections();

  const reveal = useMemo(
    () =>
      snapshot !== undefined && spots !== undefined && models !== undefined && spotId !== undefined
        ? revealFor(snapshot, spots, models, spotId, collections ?? [])
        : undefined,
    [snapshot, spots, models, spotId, collections],
  );
  const isMissing = !isLoading && spots !== undefined && !spots.some((spot) => spot.id === spotId);

  return { reveal, isLoading, isMissing };
}
