import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../constants/queryKeys';
import { ServiceError } from '../services/serviceError';
import { createSpot, deleteSpot, getMySpots, getSpotById } from '../services/spotService';
import { useAuthStore } from '../state/useAuthStore';
import type { NewSpot, Spot } from '../types/Spot';

/** Signed photo URLs live for an hour, so spots are refreshed well before that. */
const SPOTS_STALE_TIME = 5 * 60 * 1000;

/** All spots of the signed-in user (server state, cached and persisted for offline use). */
export function useMySpots() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: queryKeys.mySpots(userId),
    queryFn: userId !== undefined ? () => getMySpots(userId) : skipToken,
    staleTime: SPOTS_STALE_TIME,
  });
}

/** One spot. Starts from the cached list when possible, then refreshes from Supabase. */
export function useSpot(spotId?: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: queryKeys.spot(spotId),
    queryFn: spotId !== undefined ? () => getSpotById(spotId) : skipToken,
    initialData: () => queryClient.getQueryData<Spot[]>(queryKeys.mySpots(userId))?.find((spot) => spot.id === spotId),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.mySpots(userId))?.dataUpdatedAt,
    staleTime: SPOTS_STALE_TIME,
  });
}

export function useCreateSpot() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (input: NewSpot) => {
      if (userId === undefined) throw new ServiceError('not_signed_in');
      return createSpot(userId, input);
    },
    onSuccess: (spot) => {
      queryClient.setQueryData<Spot[]>(queryKeys.mySpots(userId), (current) => [spot, ...(current ?? [])]);
      queryClient.setQueryData(queryKeys.spot(spot.id), spot);
    },
  });
}

/** Deletes a spot with an optimistic update: it disappears at once and comes back if deleting fails. */
export function useDeleteSpot() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const key = queryKeys.mySpots(userId);
  return useMutation({
    mutationFn: (spot: Spot) => deleteSpot(spot),
    onMutate: async (spot) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Spot[]>(key);
      queryClient.setQueryData<Spot[]>(key, (current) => current?.filter((item) => item.id !== spot.id));
      return { previous };
    },
    onError: (_error, _spot, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (_data, spot) => {
      queryClient.removeQueries({ queryKey: queryKeys.spot(spot.id) });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
