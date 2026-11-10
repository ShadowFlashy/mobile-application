import { LEVEL_TITLES, LEVEL_XP_STEP } from '../../constants/levels';
import type { LevelInfo, LevelTitleKey } from '../../types/Progress';

/** XP needed to reach a level: 50 × L × (L − 1). Level 1 starts at 0. */
export function xpForLevel(level: number): number {
  const safe = Math.max(1, Math.floor(level));
  return LEVEL_XP_STEP * safe * (safe - 1);
}

/** The title held at a level (each title holds up to the level before the next one). */
export function titleForLevel(level: number): LevelTitleKey {
  let key: LevelTitleKey = 'learner';
  for (const title of LEVEL_TITLES) {
    if (level >= title.from) key = title.key;
  }
  return key;
}

/** Level, title and progress towards the next level for an XP total (negative XP counts as 0). */
export function levelForXp(xp: number): LevelInfo {
  const total = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
  // Closed-form inverse of 50·L·(L−1), then corrected for floating-point edges.
  let level = Math.max(1, Math.floor((1 + Math.sqrt(1 + (8 * total) / (2 * LEVEL_XP_STEP))) / 2));
  while (xpForLevel(level + 1) <= total) level += 1;
  while (level > 1 && xpForLevel(level) > total) level -= 1;
  const levelStartXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  return {
    level,
    titleKey: titleForLevel(level),
    xp: total,
    levelStartXp,
    nextLevelXp,
    ratio: (total - levelStartXp) / (nextLevelXp - levelStartXp),
  };
}
