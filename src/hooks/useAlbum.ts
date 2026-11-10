import { useCallback, useMemo } from 'react';
import type { AlbumCoverData, AlbumPageData, AlbumSlotData } from '../types/Album';
import type { CollectionId } from '../types/Collection';
import type { AlbumPageId } from '../types/Progress';
import type { Spot } from '../types/Spot';
import { buildAlbumCover, buildAlbumPages, buildCollectionPages, type CollectionPageData } from '../utils/album';
import { useCarModels, useCollections } from './useCarModels';
import { useMySpots } from './useSpots';

export interface UseAlbum {
  cover: AlbumCoverData;
  /** The 9 album pages in print order (8 categories, then Wildcards). */
  pages: AlbumPageData[];
  pageById: (id: AlbumPageId) => AlbumPageData | undefined;
  /** Spots of cars outside the catalogue (the Wildcards page), newest first. */
  otherSpots: Spot[];
  /** Appendix E: the themed collections as pages, in set order. Empty until they load. */
  collections: CollectionPageData[];
  collectionById: (id: CollectionId) => CollectionPageData | undefined;
  /** The slot of one catalogue model (for the sticker detail). */
  slotByModelId: (modelId: string) => AlbumSlotData | undefined;
  /** Number of stickers in the catalogue ("118 STICKERS"). */
  catalogueSize: number;
  /** Total number of the user's spots. */
  totalSpots: number;
  isLoading: boolean;
  isRefreshing: boolean;
  /** The catalogue or the spots failed to load (a failed collections query only hides the shelf). */
  isError: boolean;
  refresh: () => void;
}

/** The sticker album: the catalogue combined with the user's spots into pages, sets and a cover. */
export function useAlbum(): UseAlbum {
  const carModels = useCarModels();
  const spots = useMySpots();
  const collectionsQuery = useCollections();
  const models = carModels.data;
  const mySpots = spots.data;
  const collectionRows = collectionsQuery.data;
  const { refetch: refetchModels } = carModels;
  const { refetch: refetchSpots } = spots;
  const { refetch: refetchCollections } = collectionsQuery;

  const pages = useMemo(() => buildAlbumPages(models ?? [], mySpots ?? []), [models, mySpots]);
  const collections = useMemo(
    () => buildCollectionPages(collectionRows ?? [], models ?? [], mySpots ?? []),
    [collectionRows, models, mySpots],
  );
  const otherSpots = useMemo(() => pages.find((page) => page.id === 'wildcards')?.wildcards ?? [], [pages]);
  const cover = useMemo(() => buildAlbumCover(pages, mySpots ?? []), [pages, mySpots]);
  const slots = useMemo(() => {
    const byId = new Map<string, AlbumSlotData>();
    for (const page of pages) for (const slot of page.slots) byId.set(slot.model.id, slot);
    return byId;
  }, [pages]);

  const pageById = useCallback((id: AlbumPageId) => pages.find((page) => page.id === id), [pages]);
  const collectionById = useCallback(
    (id: CollectionId) => collections.find((page) => page.collectionId === id),
    [collections],
  );
  const slotByModelId = useCallback((modelId: string) => slots.get(modelId), [slots]);
  const refresh = useCallback(() => {
    void refetchModels();
    void refetchSpots();
    void refetchCollections();
  }, [refetchModels, refetchSpots, refetchCollections]);

  return {
    cover,
    pages,
    pageById,
    otherSpots,
    collections,
    collectionById,
    slotByModelId,
    catalogueSize: models?.length ?? 0,
    totalSpots: mySpots?.length ?? 0,
    isLoading: carModels.isPending || spots.isPending,
    isRefreshing: carModels.isRefetching || spots.isRefetching || collectionsQuery.isRefetching,
    isError: carModels.isError || spots.isError,
    refresh,
  };
}
