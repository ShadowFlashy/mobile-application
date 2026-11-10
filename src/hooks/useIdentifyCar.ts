import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { IDENTIFY_DAILY_LIMIT } from '../constants/ai';
import { queryKeys } from '../constants/queryKeys';
import { identifyCar } from '../services/aiService';
import { useAuthStore } from '../state/useAuthStore';
import { useSettingsStore } from '../state/useSettingsStore';
import type { AiImage, IdentifyOutcome, IdentifyQuota } from '../types/Identification';
import { useNetworkStatus } from './useNetworkStatus';

export interface UseIdentifyCar {
  identify: (image: AiImage) => Promise<IdentifyOutcome>;
  isPending: boolean;
}

const DISABLED: IdentifyOutcome = { status: 'unavailable', reason: 'disabled' };
const OFFLINE: IdentifyOutcome = { status: 'unavailable', reason: 'offline' };
const ERROR: IdentifyOutcome = { status: 'unavailable', reason: 'error' };

/** The stored Co-Driver switch, read at call time (so a "Fill in myself" a moment ago counts). */
async function isCoDriverEnabled(): Promise<boolean> {
  await useSettingsStore.getState().load();
  return useSettingsStore.getState().aiEnabled;
}

/**
 * Asks Co-Driver to identify the car (SPEC §10.4).
 * - With Co-Driver switched off, or offline, the function is never called (privacy invariant, §0.1).
 * - The answer is never put in the query cache: a mutation (not a query) with no retry. Only the
 *   `remainingToday` counter is copied into the quota query, for the Trust Center.
 * - `identify` never rejects: every failure is an `unavailable` outcome.
 */
export function useIdentifyCar(): UseIdentifyCar {
  const { isOnline } = useNetworkStatus();
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: identifyCar,
    retry: 0,
    // Never paused offline: a paused identify call would resume later, even after Co-Driver was switched off.
    networkMode: 'always',
    onSuccess: (outcome) => {
      if (outcome.status === 'unavailable') return;
      queryClient.setQueryData<IdentifyQuota>(queryKeys.identifyQuota(userId), (previous) => ({
        remaining: outcome.remainingToday,
        dailyLimit: previous?.dailyLimit ?? IDENTIFY_DAILY_LIMIT,
      }));
    },
  });
  const { mutateAsync } = mutation;

  const identify = useCallback(
    async (image: AiImage): Promise<IdentifyOutcome> => {
      try {
        if (!(await isCoDriverEnabled())) return DISABLED;
        if (!isOnline) return OFFLINE;
        return await mutateAsync(image);
      } catch {
        return ERROR;
      }
    },
    [isOnline, mutateAsync],
  );

  return { identify, isPending: mutation.isPending };
}
