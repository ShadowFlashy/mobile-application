import { ACHIEVEMENTS, SECRET_REVEAL_GAP, type AchievementDefinition } from '../../constants/achievements';
import type { AchievementId, AchievementProgress, AchievementTier } from '../../types/Progress';

/** Every value an achievement can measure, filled in by the replay. */
export type AchievementMetrics = Record<AchievementId, number>;

export type TierName = 'bronze' | 'silver' | 'gold';

/** The thresholds of an achievement, resolving `'catalogue'` to the catalogue size (at least 1). */
export function thresholdsOf(definition: AchievementDefinition, catalogueSize: number): readonly number[] {
  if (definition.thresholds === 'catalogue') return [Math.max(1, catalogueSize)];
  return definition.thresholds;
}

/** 0 = locked, 1 bronze, 2 silver, 3 gold; a single-threshold achievement goes straight to gold. */
export function tierFor(value: number, thresholds: readonly number[]): AchievementTier {
  const reached = thresholds.filter((threshold) => value >= threshold).length;
  if (thresholds.length === 1) return reached >= 1 ? 3 : 0;
  if (reached >= 3) return 3;
  if (reached === 2) return 2;
  if (reached === 1) return 1;
  return 0;
}

/** The tiers passed on the way from one tier to a higher one (bronze → gold passes silver too). */
export function tiersBetween(from: AchievementTier, to: AchievementTier, singleThreshold: boolean): AchievementTier[] {
  if (singleThreshold) return from < 3 && to === 3 ? [3] : [];
  const tiers: AchievementTier[] = [];
  if (from < 1 && to >= 1) tiers.push(1);
  if (from < 2 && to >= 2) tiers.push(2);
  if (from < 3 && to >= 3) tiers.push(3);
  return tiers;
}

export function tierName(tier: AchievementTier): TierName | undefined {
  switch (tier) {
    case 0:
      return undefined;
    case 1:
      return 'bronze';
    case 2:
      return 'silver';
    case 3:
      return 'gold';
  }
}

/** Secret plaques show "???" until the value is within SECRET_REVEAL_GAP of the threshold. */
export function isStillSecret(
  definition: AchievementDefinition,
  value: number,
  thresholds: readonly number[],
): boolean {
  if (definition.secret !== true) return false;
  const last = thresholds[thresholds.length - 1] ?? 0;
  return value < last - SECRET_REVEAL_GAP;
}

/** The plaque state of one achievement. */
export function achievementProgress(
  definition: AchievementDefinition,
  value: number,
  catalogueSize: number,
  unlockedAt: AchievementProgress['unlockedAt'],
): AchievementProgress {
  const thresholds = thresholdsOf(definition, catalogueSize);
  const tier = tierFor(value, thresholds);
  return {
    id: definition.id,
    tier,
    value,
    nextThreshold: thresholds.find((threshold) => value < threshold),
    isSecret: isStillSecret(definition, value, thresholds),
    unlockedAt,
  };
}

/** All plaques, in cabinet order. */
export function buildAchievements(
  metrics: AchievementMetrics,
  catalogueSize: number,
  unlockedAt: Partial<Record<AchievementId, AchievementProgress['unlockedAt']>>,
): AchievementProgress[] {
  return ACHIEVEMENTS.map((definition) =>
    achievementProgress(definition, metrics[definition.id], catalogueSize, unlockedAt[definition.id] ?? {}),
  );
}

export function achievementDefinition(id: AchievementId): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((definition) => definition.id === id);
}

/** Key under which a seen plaque tier is stored in settings (`seenAchievements`). */
export function seenKey(id: AchievementId, tier: AchievementTier): string {
  return `${id}:${tier}`;
}
