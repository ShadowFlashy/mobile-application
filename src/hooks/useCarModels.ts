import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../constants/queryKeys';
import { DAY } from '../constants/time';
import { getCarModels, getCollections } from '../services/carModelService';

/** The sticker catalogue (server state). It hardly ever changes, so it stays fresh for a day. */
export function useCarModels() {
  return useQuery({ queryKey: queryKeys.carModels(), queryFn: getCarModels, staleTime: DAY });
}

/** The themed collections (Appendix E): reference data like the catalogue, fresh for a day. */
export function useCollections() {
  return useQuery({ queryKey: queryKeys.collections(), queryFn: getCollections, staleTime: DAY });
}
