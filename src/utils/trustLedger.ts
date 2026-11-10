import type { IdentifyQuota } from '../types/Identification';
import type { Spot } from '../types/Spot';

/**
 * "What Redline stores" (SPEC P0-18): counted from the user's own spots. Licence plates and GPS
 * points are always 0 because the app never stores them (privacy invariants, SPEC §0.1 rule 13):
 * the types are the literal 0, so no code path can ever report anything else.
 */
export interface TrustLedgerData {
  /** Blurred (redacted, re-encoded) photos: one per spot. */
  photos: number;
  plates: 0;
  gpsPoints: 0;
  /** Distinct city labels, case-insensitive. */
  cities: number;
  /** Auto-fill scans left today; undefined while unknown (offline, loading). */
  aiCallsLeft?: number;
  aiDailyLimit?: number;
}

/** Builds the ledger from the spots and the Auto-fill quota (both optional while loading). */
export function buildTrustLedger(spots: readonly Spot[] | undefined, quota?: IdentifyQuota): TrustLedgerData {
  const list = spots ?? [];
  const cities = new Set<string>();
  for (const spot of list) {
    const city = spot.city?.trim().toLocaleLowerCase();
    if (city !== undefined && city.length > 0) cities.add(city);
  }
  return {
    photos: list.length,
    plates: 0,
    gpsPoints: 0,
    cities: cities.size,
    aiCallsLeft: quota === undefined ? undefined : Math.max(0, Math.min(quota.remaining, quota.dailyLimit)),
    aiDailyLimit: quota?.dailyLimit,
  };
}
