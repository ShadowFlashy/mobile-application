/**
 * Progression engine (W6, SPEC P0-13): XP ledger, levels, weekly challenges, weekly streak,
 * achievements and reveal data, all derived on the device from the user's own spots (D-6).
 * Pure TypeScript: no React, no I/O, deterministic for the same input.
 */
export {
  achievementDefinition,
  achievementProgress,
  buildAchievements,
  isStillSecret,
  seenKey,
  thresholdsOf,
  tierFor,
  tierName,
  tiersBetween,
} from './achievements';
export type { AchievementMetrics, TierName } from './achievements';
export { challengeId, evaluateChallenge, parseChallengeId, rarityRank, weeklyChallenges } from './challenges';
export type { ChallengeFact } from './challenges';
export { countdownTo } from './countdown';
export type { Countdown } from './countdown';
export {
  collectionMembers,
  collectionsByModel,
  deriveProgress,
  modelOfSpot,
  pageIdOf,
  replayOrder,
  timeOf,
} from './derive';
export { levelForXp, titleForLevel, xpForLevel } from './levels';
export { fnv1a32, mulberry32, pick, randomInt } from './prng';
export { revealFor } from './reveal';
export { bestRun, computeWeeklyStreak, runEndingAt, STREAK_CHART_WEEKS } from './streak';
export {
  deviceUtcOffset,
  isLastDayOfWeek,
  isoWeekKey,
  localDayKey,
  offsetAt,
  parseWeekKey,
  shiftWeekKey,
  weekBounds,
} from './weeks';
export type { UtcOffset } from './weeks';
export { achievementTierXp, challengeXp, newStickerXp, recordSpot, scoreSpot, streakXp } from './xp';
export type { ModelHistory, SpotScore } from './xp';
