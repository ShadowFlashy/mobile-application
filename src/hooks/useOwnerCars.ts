import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../constants/queryKeys';
import { MINUTE } from '../constants/time';
import {
  deleteOwnerCar,
  getMyOwnerCars,
  getOwnerCarStats,
  registerOwnerCar,
  updateOwnerCar,
} from '../services/ownerService';
import { useAuthStore } from '../state/useAuthStore';
import type { NewOwnerCar, OwnerCar, OwnerCarChanges, OwnerCarStats } from '../types/OwnerCar';

/** Owners can register at most 3 cars (enforced by the database trigger as well). */
export const MAX_OWNER_CARS = 3;

/** Cars the signed-in user registered in the Garage. */
export function useOwnerCars() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: queryKeys.ownerCars(userId),
    queryFn: userId !== undefined ? getMyOwnerCars : skipToken,
  });
}

/** One registered car, read from the Garage list (it holds at most 3 cars). */
export function useOwnerCar(carId?: string) {
  const query = useOwnerCars();
  const car = carId !== undefined ? query.data?.find((item) => item.id === carId) : undefined;
  return {
    car,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    /** Loaded, but this car does not exist (anymore). */
    isMissing: query.isSuccess && car === undefined,
    refetch: query.refetch,
  };
}

/** Sightings and unread counts per car, counted on the server. Drives the Garage tab badge. */
export function useOwnerCarStats() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: queryKeys.ownerCarStats(userId),
    queryFn: userId !== undefined ? getOwnerCarStats : skipToken,
    staleTime: MINUTE,
  });
}

/** Stats of one car, or undefined while loading or when it has none yet. */
export function statsForCar(stats: readonly OwnerCarStats[] | undefined, carId: string): OwnerCarStats | undefined {
  return stats?.find((item) => item.ownerCarId === carId);
}

export function useRegisterOwnerCar() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (input: NewOwnerCar) => registerOwnerCar(input),
    onSuccess: (car) => {
      queryClient.setQueryData<OwnerCar[]>(queryKeys.ownerCars(userId), (current) => [
        car,
        ...(current ?? []).filter((item) => item.id !== car.id),
      ]);
      void queryClient.invalidateQueries({ queryKey: queryKeys.ownerCarStats(userId) });
    },
  });
}

interface UpdateOwnerCarInput {
  carId: string;
  changes: OwnerCarChanges;
}

/** Saves car settings. Pausing pings is optimistic, so the switch flips at once. */
export function useUpdateOwnerCar() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const key = queryKeys.ownerCars(userId);
  return useMutation({
    mutationFn: ({ carId, changes }: UpdateOwnerCarInput) => updateOwnerCar(carId, changes),
    onMutate: async ({ carId, changes }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<OwnerCar[]>(key);
      const pingsPaused = changes.pingsPaused;
      if (pingsPaused !== undefined) {
        queryClient.setQueryData<OwnerCar[]>(key, (current) =>
          current?.map((car) => (car.id === carId ? { ...car, pingsPaused } : car)),
        );
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<OwnerCar[]>(key, (current) =>
        current?.map((car) => (car.id === updated.id ? updated : car)),
      );
    },
  });
}

export function useDeleteOwnerCar() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (carId: string) => deleteOwnerCar(carId),
    onSuccess: (_data, carId) => {
      queryClient.setQueryData<OwnerCar[]>(queryKeys.ownerCars(userId), (current) =>
        current?.filter((car) => car.id !== carId),
      );
      // Its sightings are deleted with it (on delete cascade).
      void queryClient.invalidateQueries({ queryKey: queryKeys.pings(userId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ownerCarStats(userId) });
    },
  });
}
