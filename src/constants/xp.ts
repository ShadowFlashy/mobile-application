import type { Rarity } from '../types/CarModel';
import type { ChallengeSlot } from '../types/Progress';

/**
 * The XP table (SPEC §4.4, binding; Appendix E adds `setComplete`). Progress is derived on the
 * device from the user's own spots (D-6), so changing a value here re-scores every ledger.
 */
export const XP = {
  /** Every spot, catalogue or not. */
  spot: 10,
  /** First spot of a catalogue model, by rarity. */
  newSticker: { common: 40, rare: 80, epic: 160, legendary: 400 } satisfies Record<Rarity, number>,
  /** A model you already have: scored once per model per 24 h of `spottedAt`. */
  duplicate: 5,
  /** A collected model in a paint not seen before (paint ≠ other): instead of the duplicate XP. */
  freshPaint: 25,
  /** A car outside the catalogue. */
  wildcard: 15,
  /** Every model of a category page collected. */
  pageComplete: 300,
  /** Appendix E: every car of a themed collection collected. */
  setComplete: 250,
  /** Every catalogue model collected (48/48 in Season 1; the whole catalogue since Appendix E). */
  albumComplete: 2000,
  /** Weekly challenges per slot. */
  challenge: { warmup: 75, main: 125, stretch: 250 } satisfies Record<ChallengeSlot, number>,
  /** All three challenges of a week. */
  cleanSweep: 150,
  /** The first spot in a new consecutive week: `streakPerWeek × min(streakWeeks, streakCap)`. */
  streakPerWeek: 25,
  streakCap: 8,
  /** Achievement tiers; single-threshold achievements count as gold. */
  achievementTier: { bronze: 50, silver: 100, gold: 250 },
  /** Owner matches never earn XP (no incentive to hunt plates). */
  ownerMatch: 0,
} as const;

/** The 24 h window of the duplicate XP, in ms of `spottedAt`. */
export const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
