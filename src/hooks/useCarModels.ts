import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../constants/queryKeys';
import { getCarModels } from '../services/carModelService';

const DAY = 24 * 60 * 60 * 1000;

/** The sticker catalogue (server state). It hardly ever changes, so it stays fresh for a day. */
export function useCarModels() {
  return useQuery({ queryKey: queryKeys.carModels(), queryFn: getCarModels, staleTime: DAY });
}
