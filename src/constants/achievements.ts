import type { IconName } from '../components/primitives/Icon';
import type { AchievementId } from '../types/Progress';

/**
 * Thresholds of an achievement: `[bronze, silver, gold]`, or a single threshold (counts as gold).
 * `'catalogue'` means "the size of the catalogue" (the whole album, 118 cars since Appendix E).
 */
export type AchievementThresholds = readonly [number] | readonly [number, number, number] | 'catalogue';

export interface AchievementDefinition {
  id: AchievementId;
  thresholds: AchievementThresholds;
  icon: IconName;
  /** Hidden ("???") until the value is at most `SECRET_REVEAL_GAP` below the threshold. */
  secret?: boolean;
}

/** `redline` is secret until 40/48 in Season 1: 8 stickers before the end of the album. */
export const SECRET_REVEAL_GAP = 8;

/** The 3 cars of `holy_trinity`. */
export const HOLY_TRINITY_IDS = ['ferrari-laferrari', 'mclaren-p1', 'porsche-918-spyder'] as const;

/**
 * The dash plaques (SPEC §4.4 plus Appendix E `set_collector`), in cabinet order.
 * Titles and descriptions: t(`achievements.${id}.title`) / t(`achievements.${id}.description`).
 */
export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  { id: 'ignition', thresholds: [1], icon: 'key-outline' },
  { id: 'spotter', thresholds: [10, 50, 200], icon: 'camera-outline' },
  { id: 'collector', thresholds: [6, 24, 48], icon: 'albums-outline' },
  { id: 'full_page', thresholds: [1, 4, 8], icon: 'document-text-outline' },
  { id: 'set_collector', thresholds: [1, 4, 8], icon: 'layers-outline' },
  { id: 'legend_hunter', thresholds: [1, 4, 11], icon: 'trophy-outline' },
  { id: 'paint_shop', thresholds: [3, 6, 10], icon: 'color-palette-outline' },
  { id: 'globetrotter', thresholds: [3, 5, 8], icon: 'globe-outline' },
  { id: 'wildcard', thresholds: [1, 10, 50], icon: 'help-circle-outline' },
  { id: 'regular', thresholds: [2, 6, 12], icon: 'flame-outline' },
  { id: 'pit_wall', thresholds: [3, 15, 50], icon: 'flag-outline' },
  { id: 'clean_plates', thresholds: [5, 25, 100], icon: 'eye-off-outline' },
  { id: 'logbook', thresholds: [5, 25, 100], icon: 'book-outline' },
  { id: 'holy_trinity', thresholds: [3], icon: 'triangle-outline' },
  { id: 'redline', thresholds: 'catalogue', icon: 'speedometer-outline', secret: true },
];
