import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../constants/queryKeys';
import { deleteOwnerCar, getMyOwnerCars, registerOwnerCar, setPlateVisibility } from '../services/ownerService';
import { useAuthStore } from '../state/useAuthStore';
import type { NewOwnerCar, OwnerCar } from '../types/OwnerCar';

/** Cars the signed-in user registered in the owner portal. */
export function useOwnerCars() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: queryKeys.ownerCars(userId),
    queryFn: userId !== undefined ? getMyOwnerCars : skipToken,
  });
}

export function useRegisterOwnerCar() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (input: NewOwnerCar) => registerOwnerCar(input),
    onSuccess: (car) => {
      queryClient.setQueryData<OwnerCar[]>(queryKeys.ownerCars(userId), (current) => [car, ...(current ?? [])]);
    },
  });
}

export function useRemoveOwnerCar() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (carId: string) => deleteOwnerCar(carId),
    onSuccess: (_data, carId) => {
      queryClient.setQueryData<OwnerCar[]>(queryKeys.ownerCars(userId), (current) =>
        current?.filter((car) => car.id !== carId),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.pings(userId) });
    },
  });
}

interface PlateVisibilityInput {
  carId: string;
  showPlate: boolean;
  plate?: string;
}

export function useSetPlateVisibility() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  return useMutation({
    mutationFn: ({ carId, showPlate, plate }: PlateVisibilityInput) => setPlateVisibility(carId, showPlate, plate),
    onSuccess: (updated) => {
      queryClient.setQueryData<OwnerCar[]>(queryKeys.ownerCars(userId), (current) =>
        current?.map((car) => (car.id === updated.id ? updated : car)),
      );
    },
  });
}
