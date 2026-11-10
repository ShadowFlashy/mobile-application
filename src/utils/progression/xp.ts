import { DUPLICATE_WINDOW_MS, XP } from '../../constants/xp';
import type { CarModel, PaintColor } from '../../types/CarModel';
import type { AchievementTier, ChallengeSlot, RevealKind } from '../../types/Progress';

/** What the replay remembers about one collected model. */
export interface ModelHistory {
  /** Spots of this model so far. */
  count: number;
  /** Distinct paints seen on it (never `other`), in order. */
  paints: PaintColor[];
  /** `spottedAt` (ms) of every spot of it that scored sticker XP (new, duplicate or fresh paint). */
  scoredAt: number[];
}

/** The sticker part of one spot's score (the +10 for logging it is separate). */
export interface SpotScore {
  kind: RevealKind;
  /** XP for the sticker itself; 0 for a duplicate inside the 24 h window. */
  amount: number;
  /** True when the duplicate / fresh-paint / new XP was awarded (feeds the 24 h window). */
  scored: boolean;
}

export function newStickerXp(model: CarModel): number {
  return XP.newSticker[model.rarity];
}

/** Streak XP for the first spot in a new consecutive week; a 1-week "streak" is not an extension. */
export function streakXp(streakWeeks: number): number {
  if (streakWeeks < 2) return 0;
  return XP.streakPerWeek * Math.min(streakWeeks, XP.streakCap);
}

export function challengeXp(slot: ChallengeSlot): number {
  return XP.challenge[slot];
}

/** XP of an achievement tier; single-threshold achievements count as gold. */
export function achievementTierXp(tier: AchievementTier): number {
  switch (tier) {
    case 0:
      return 0;
    case 1:
      return XP.achievementTier.bronze;
    case 2:
      return XP.achievementTier.silver;
    case 3:
      return XP.achievementTier.gold;
  }
}

/**
 * Scores the sticker part of a spot (SPEC §4.4):
 * - off-catalogue → wildcard +15
 * - first spot of a model → new sticker by rarity
 * - a known model in a paint not seen before (≠ other) → fresh paint +25
 * - otherwise a duplicate: +5, but only once per model per 24 h of `spottedAt`
 */
export function scoreSpot(
  model: CarModel | undefined,
  paint: PaintColor,
  spottedAtMs: number,
  history: ModelHistory | undefined,
): SpotScore {
  if (model === undefined) return { kind: 'wildcard', amount: XP.wildcard, scored: true };
  if (history === undefined || history.count === 0) {
    return { kind: 'new', amount: newStickerXp(model), scored: true };
  }
  if (paint !== 'other' && !history.paints.includes(paint)) {
    return { kind: 'fresh_paint', amount: XP.freshPaint, scored: true };
  }
  const inWindow = history.scoredAt.some((at) => Math.abs(at - spottedAtMs) < DUPLICATE_WINDOW_MS);
  if (inWindow) return { kind: 'duplicate', amount: 0, scored: false };
  return { kind: 'duplicate', amount: XP.duplicate, scored: true };
}

/** The history after a scored (or unscored) spot of the model. */
export function recordSpot(
  history: ModelHistory | undefined,
  paint: PaintColor,
  spottedAtMs: number,
  scored: boolean,
): ModelHistory {
  const base: ModelHistory = history ?? { count: 0, paints: [], scoredAt: [] };
  return {
    count: base.count + 1,
    paints: paint !== 'other' && !base.paints.includes(paint) ? [...base.paints, paint] : base.paints,
    scoredAt: scored ? [...base.scoredAt, spottedAtMs] : base.scoredAt,
  };
}
