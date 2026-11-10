import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { queryKeys } from '../constants/queryKeys';
import { SECOND } from '../constants/time';
import { getErrorMessage } from '../services/serviceError';
import { startOwnerVerification } from '../services/ownerService';
import { useAuthStore } from '../state/useAuthStore';
import type { VerificationCode } from '../types/OwnerCar';
import { isExpired, remainingMs } from '../utils/verificationCode';

export interface Verification {
  /** The active one-time code (memory only, never persisted). */
  code?: VerificationCode;
  /** Milliseconds until the code expires; 0 without a code. */
  remainingMs: number;
  isExpired: boolean;
  isStarting: boolean;
  /** Translated message when the code could not be requested. */
  error?: string;
  /** Requests a new code RL-XXXXXX, valid for 30 minutes. */
  start: () => void;
}

/**
 * P1-14 automated verification (SPEC §6.8 step 3): requests a one-time code and ticks a live
 * countdown. The code lives only in this hook's state, never in the query cache or storage.
 * In P0 the Redline team verifies owners; this hook is ready for the P1 screen.
 */
export function useVerification(carId?: string): Verification {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const [code, setCode] = useState<VerificationCode>();
  const [now, setNow] = useState(() => new Date());

  const mutation = useMutation({
    mutationFn: (id: string) => startOwnerVerification(id),
    onSuccess: (next) => {
      setCode(next);
      setNow(new Date());
      // verify_expires_at changed on the car.
      void queryClient.invalidateQueries({ queryKey: queryKeys.ownerCars(userId) });
    },
  });

  const expiresAt = code?.expiresAt;
  useEffect(() => {
    if (expiresAt === undefined) return undefined;
    const timer = setInterval(() => {
      const current = new Date();
      setNow(current);
      if (isExpired(expiresAt, current)) clearInterval(timer);
    }, SECOND);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const left = expiresAt !== undefined ? remainingMs(expiresAt, now) : 0;
  return {
    code,
    remainingMs: left,
    isExpired: expiresAt !== undefined && left === 0,
    isStarting: mutation.isPending,
    error: mutation.isError ? getErrorMessage(mutation.error, 'start_verification') : undefined,
    start: () => {
      if (carId !== undefined) mutation.mutate(carId);
    },
  };
}
