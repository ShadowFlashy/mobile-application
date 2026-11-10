import { useTranslation } from 'react-i18next';
import type { LevelInfo } from '../../types/Progress';
import { Readout } from '../primitives/Readout';

export interface LevelReadoutProps {
  level: LevelInfo;
  /** `large` (default, 34 px) or `compact`. */
  size?: 'large' | 'compact';
  testID?: string;
}

/** XP still needed for the next level (never negative). */
export function xpToNextLevel(level: LevelInfo): number {
  return Math.max(0, level.nextLevelXp - level.xp);
}

/**
 * "LVL 8" with "Expert · 585 XP to level 9" with a 2 px progress line: the F1 "LAP 34/57" readout for the level.
 * The figure is spoken as "Level 8".
 */
export function LevelReadout({ level, size = 'large', testID = 'level-readout' }: LevelReadoutProps) {
  const { t, i18n } = useTranslation();
  const next = level.level + 1;
  const ratio = Math.min(1, Math.max(0, Number.isFinite(level.ratio) ? level.ratio : 0));
  const remaining = new Intl.NumberFormat(i18n.language).format(xpToNextLevel(level));
  return (
    <Readout
      unit={t('progress.level_short')}
      value={String(level.level)}
      meta={t('progress.level_meta', { title: t(`levels.${level.titleKey}`), remaining, next })}
      progress={ratio}
      progressLabel={t('progress.level_progress_label', { percent: Math.round(ratio * 100), next })}
      accessibilityLabel={t('progress.level_label', { level: level.level })}
      size={size}
      testID={testID}
    />
  );
}
