import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  skipToken,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '../constants/queryKeys';
import { routes } from '../constants/routes';
import { MINUTE } from '../constants/time';
import {
  getSightingById,
  getSightings,
  markAllSightingsRead,
  markSightingRead,
  subscribeToSightings,
} from '../services/ownerService';
import { useAuthStore } from '../state/useAuthStore';
import { useToastStore } from '../state/useToastStore';
import type { OwnerCarStats, Sighting } from '../types/OwnerCar';
import { markRead, mergeSightingPages, nextSightingsCursor } from '../utils/sightings';
import { useOwnerCarStats } from './useOwnerCars';

/**
 * Sightings: privacy-safe snapshots of the moments one of the owner's verified cars was spotted.
 * The file keeps its v1 name (usePings) so the layouts' imports stay stable.
 */

type SightingPages = InfiniteData<Sighting[], string | undefined>;
type PingsKey = ReturnType<typeof queryKeys.pings>;

/** Signed photo URLs live for an hour; the feed refreshes well before that. */
const SIGHTINGS_STALE_TIME = 5 * MINUTE;

/** The sightings feed, newest first, paged by 20 ("Load more" fetches the next page). */
export function useSightings() {
  const userId = useAuthStore((state) => state.user?.id);
  const query = useInfiniteQuery<Sighting[], Error, SightingPages, PingsKey, string | undefined>({
    queryKey: queryKeys.pings(userId),
    queryFn: ({ pageParam }) => getSightings({ before: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => nextSightingsCursor(lastPage),
    enabled: userId !== undefined,
    staleTime: SIGHTINGS_STALE_TIME,
  });
  const sightings = useMemo(() => mergeSightingPages(query.data?.pages ?? []), [query.data]);
  return { ...query, sightings };
}

/** Applies a change to every cached copy of the feed. */
function updateFeed(queryClient: QueryClient, userId: string | undefined, change: (list: Sighting[]) => Sighting[]) {
  queryClient.setQueryData<SightingPages>(queryKeys.pings(userId), (current) =>
    current === undefined ? current : { ...current, pages: current.pages.map((page) => change(page)) },
  );
}

/** Lowers the unread counter of one car (or of every car) in the cached stats. */
function updateUnread(queryClient: QueryClient, userId: string | undefined, carId?: string) {
  queryClient.setQueryData<OwnerCarStats[]>(queryKeys.ownerCarStats(userId), (current) =>
    current?.map((stats) =>
      carId === undefined
        ? { ...stats, unread: 0 }
        : stats.ownerCarId === carId
          ? { ...stats, unread: Math.max(0, stats.unread - 1) }
          : stats,
    ),
  );
}

interface SightingResult {
  sighting?: Sighting;
}

/** One sighting. Starts from the cached feed when possible, then refreshes from Supabase. */
export function useSighting(sightingId?: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const query = useQuery<SightingResult>({
    queryKey: queryKeys.sighting(sightingId),
    queryFn: sightingId !== undefined ? async () => ({ sighting: await getSightingById(sightingId) }) : skipToken,
    initialData: () => {
      const cached = queryClient
        .getQueryData<SightingPages>(queryKeys.pings(userId))
        ?.pages.flat()
        .find((item) => item.id === sightingId);
      return cached !== undefined ? { sighting: cached } : undefined;
    },
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.pings(userId))?.dataUpdatedAt,
    staleTime: SIGHTINGS_STALE_TIME,
  });
  return {
    sighting: query.data?.sighting,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isMissing: query.isSuccess && query.data.sighting === undefined,
    refetch: query.refetch,
  };
}

/** Marks one sighting as read, optimistically (feed, detail and the tab badge update at once). */
export function useMarkSightingRead() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (sighting: Sighting) => markSightingRead(sighting.id),
    onMutate: (sighting) => {
      updateFeed(queryClient, userId, (list) => markRead(list, sighting.id));
      queryClient.setQueryData<SightingResult>(queryKeys.sighting(sighting.id), {
        sighting: { ...sighting, isRead: true },
      });
      if (!sighting.isRead) updateUnread(queryClient, userId, sighting.ownerCarId);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ownerCarStats(userId) });
    },
  });
}

/** "Mark all read", optimistically; the server counters are refreshed afterwards. */
export function useMarkAllSightingsRead() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: markAllSightingsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.pings(userId) });
      const previousFeed = queryClient.getQueryData<SightingPages>(queryKeys.pings(userId));
      const previousStats = queryClient.getQueryData<OwnerCarStats[]>(queryKeys.ownerCarStats(userId));
      updateFeed(queryClient, userId, (list) => markRead(list));
      updateUnread(queryClient, userId);
      return { previousFeed, previousStats };
    },
    onError: (_error, _input, context) => {
      if (context?.previousFeed !== undefined) queryClient.setQueryData(queryKeys.pings(userId), context.previousFeed);
      if (context?.previousStats !== undefined) {
        queryClient.setQueryData(queryKeys.ownerCarStats(userId), context.previousStats);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ownerCarStats(userId) });
    },
  });
}

/**
 * The sighting screen: loads the snapshot and marks it read once it is shown (P0-17: opening a
 * sighting marks it read).
 */
export function useOpenSighting(sightingId?: string) {
  const result = useSighting(sightingId);
  const { mutate } = useMarkSightingRead();
  const marked = useRef<string | undefined>(undefined);
  const { sighting } = result;

  useEffect(() => {
    if (sighting === undefined || sighting.isRead || marked.current === sighting.id) return;
    marked.current = sighting.id;
    mutate(sighting);
  }, [sighting, mutate]);

  return result;
}

/** Number of unread sightings over all cars (server counters), shown as the Garage tab badge. */
export function useUnreadPingCount(): number {
  const { data } = useOwnerCarStats();
  return data?.reduce((total, stats) => total + stats.unread, 0) ?? 0;
}

/**
 * Live sightings through Supabase Realtime: every time one of the owner's cars is spotted, the
 * snapshot is added to the feed, the badge counters refresh and a toast offers to open it.
 */
export function usePingSubscription(userId?: string): void {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);
  const { t } = useTranslation();

  useEffect(() => {
    if (userId === undefined) return undefined;
    const unsubscribe = subscribeToSightings(userId, (sightingId) => {
      void getSightingById(sightingId)
        .then((sighting) => {
          if (sighting === undefined) return;
          queryClient.setQueryData<SightingPages>(queryKeys.pings(userId), (current) => {
            if (current === undefined) return current;
            const exists = current.pages.some((page) => page.some((item) => item.id === sighting.id));
            if (exists) return current;
            const [first = [], ...rest] = current.pages;
            return { ...current, pages: [[sighting, ...first], ...rest] };
          });
          queryClient.setQueryData<SightingResult>(queryKeys.sighting(sighting.id), { sighting });
          void queryClient.invalidateQueries({ queryKey: queryKeys.ownerCarStats(userId) });
          const message =
            sighting.city !== undefined
              ? t('sightings.toast_with_city', { car: sighting.carLabel, city: sighting.city })
              : t('sightings.toast', { car: sighting.carLabel });
          showToast(message, 'success', {
            label: t('sightings.toast_open'),
            onPress: () => router.push(routes.sighting(sighting.id)),
          });
        })
        .catch(() => undefined);
    });
    return unsubscribe;
  }, [userId, queryClient, showToast, t]);
}
