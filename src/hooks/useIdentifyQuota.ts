import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../constants/queryKeys';
import { MINUTE } from '../constants/time';
import { getIdentifyQuota } from '../services/aiService';
import { useAuthStore } from '../state/useAuthStore';

/**
 * Co-Driver scans left today (15/day) for the Trust Center (SPEC P0-01). Each identification also
 * updates this query with its `remainingToday` (see useIdentifyCar). Marked `persist: false`: the
 * counter is kept in memory and is meaningless after a day anyway.
 */
export function useIdentifyQuota() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: queryKeys.identifyQuota(userId),
    queryFn: getIdentifyQuota,
    enabled: userId !== undefined,
    staleTime: MINUTE,
    meta: { persist: false },
  });
}
