import type { LevelTitleKey } from '../types/Progress';

/** Reaching level L needs `LEVEL_XP_STEP × L × (L − 1)` XP: L2 = 100, L5 = 1,000, L10 = 4,500 (SPEC §4.4). */
export const LEVEL_XP_STEP = 50;

/**
 * Driver titles: each holds from its first level up to the level before the next title.
 * Ascending by level. Labels are translated: t(`levels.${key}`).
 */
export const LEVEL_TITLES: readonly { from: number; key: LevelTitleKey }[] = [
  { from: 1, key: 'learner' },
  { from: 3, key: 'kerbside_scout' },
  { from: 6, key: 'car_park_hunter' },
  { from: 10, key: 'meet_regular' },
  { from: 15, key: 'track_day_spotter' },
  { from: 20, key: 'paddock_pass' },
  { from: 30, key: 'pit_lane_pro' },
  { from: 40, key: 'works_spotter' },
  { from: 50, key: 'redline_legend' },
];
