import { MINUTE, SECOND } from '../constants/time';
import type { OwnerCar } from '../types/OwnerCar';

/**
 * Helpers for owner verification (SPEC D-3, §6.8). In P0 the Redline team verifies owners; the
 * one-time code flow (P1-14) uses the same alphabet as start_owner_verification in the migration.
 */

/** 25 symbols without look-alikes (0/O, 1/I/L, 2/Z, 5/S, 8/B): must equal the SQL alphabet. */
export const VERIFICATION_ALPHABET = 'ACDEFGHJKMNPQRTUVWXY34679';
export const VERIFICATION_CODE_LENGTH = 6;
export const VERIFICATION_PREFIX = 'RL-';
/** A code is valid for 30 minutes (start_owner_verification). */
export const VERIFICATION_VALIDITY_MS = 30 * MINUTE;

const CODE_PATTERN = new RegExp(`^RL-[${VERIFICATION_ALPHABET}]{${VERIFICATION_CODE_LENGTH}}$`);

/** True for a well-formed code such as "RL-7K3QX9". */
export function isVerificationCode(value: string): boolean {
  return CODE_PATTERN.test(value);
}

/**
 * Normalises what someone typed or what was read from a photo ("rl 7k3-qx9", "7K3QX9") into
 * "RL-7K3QX9", like complete_owner_verification does. Returns undefined when it cannot be a code.
 */
export function normalizeVerificationCode(input: string): string | undefined {
  let symbols = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (symbols.length === VERIFICATION_CODE_LENGTH + 2 && symbols.startsWith('RL')) symbols = symbols.slice(2);
  if (symbols.length !== VERIFICATION_CODE_LENGTH) return undefined;
  const code = `${VERIFICATION_PREFIX}${symbols}`;
  return isVerificationCode(code) ? code : undefined;
}

/** Milliseconds left until `expiresAt` (never negative; 0 for an invalid date). */
export function remainingMs(expiresAt: string, now: Date = new Date()): number {
  const expires = new Date(expiresAt).getTime();
  if (Number.isNaN(expires)) return 0;
  return Math.max(0, expires - now.getTime());
}

export function isExpired(expiresAt: string, now: Date = new Date()): boolean {
  return remainingMs(expiresAt, now) === 0;
}

/** Countdown "29:59" (minutes:seconds, rounded up so it reaches "00:00" exactly at expiry). */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / SECOND));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** What the Garage shows for a car: pending cars get nothing, paused cars are verified but silent. */
export type OwnerCarStatus = 'pending' | 'verified' | 'paused';

export function ownerCarStatus(car: Pick<OwnerCar, 'verification' | 'pingsPaused'>): OwnerCarStatus {
  if (car.verification !== 'verified') return 'pending';
  return car.pingsPaused ? 'paused' : 'verified';
}

/** A verification code can only be requested for a car that is not verified yet. */
export function canStartVerification(car: Pick<OwnerCar, 'verification'>): boolean {
  return car.verification === 'pending';
}
