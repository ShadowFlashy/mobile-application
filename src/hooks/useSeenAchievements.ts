import { useCallback, useMemo } from 'react';
import type { AchievementProgress } from '../types/Progress';
import { seenKey } from '../utils/progression';
import { useSettings } from './useSettings';

export interface UseSeenAchievements {
  /** True for an unlocked plaque tier the user has not looked at yet (the "new" dot). */
  isNew: (achievement: AchievementProgress) => boolean;
  /** Remembers the plaques' current tiers as seen (stored on the device through settings). */
  markSeen: (achievements: readonly AchievementProgress[]) => void;
}

/** Which dash-plaque tiers were already seen, stored locally as `seenAchievements` ("id:tier"). */
export function useSeenAchievements(): UseSeenAchievements {
  const { settings, update, isLoaded } = useSettings();
  const seen = useMemo(() => new Set(settings.seenAchievements), [settings.seenAchievements]);

  const isNew = useCallback(
    (achievement: AchievementProgress) =>
      isLoaded && achievement.tier > 0 && !seen.has(seenKey(achievement.id, achievement.tier)),
    [isLoaded, seen],
  );

  const markSeen = useCallback(
    (achievements: readonly AchievementProgress[]) => {
      const fresh = achievements
        .filter((achievement) => achievement.tier > 0)
        .map((achievement) => seenKey(achievement.id, achievement.tier))
        .filter((key) => !seen.has(key));
      if (fresh.length > 0) update({ seenAchievements: [...seen, ...fresh] });
    },
    [seen, update],
  );

  return useMemo(() => ({ isNew, markSeen }), [isNew, markSeen]);
}
