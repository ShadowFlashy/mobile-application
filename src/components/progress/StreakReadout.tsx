import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, spacing } from '../../theme';
import type { StreakInfo } from '../../types/Progress';
import { Readout } from '../primitives/Readout';

export interface StreakReadoutProps {
  streak: StreakInfo;
  /** Default `streak-readout`; the history gets `<testID>-chart`, its bars `<testID>-week-on|off`. */
  testID?: string;
}

/** Which line to show under the streak. */
export type StreakHint = 'at_risk' | 'this_week' | 'alive' | 'start';

export function streakHint(streak: StreakInfo): StreakHint {
  const thisWeek = streak.lastWeeks[streak.lastWeeks.length - 1] === true;
  if (streak.atRisk) return 'at_risk';
  if (streak.current > 0 && thisWeek) return 'this_week';
  if (streak.current > 0) return 'alive';
  return 'start';
}

/**
 * The weekly streak as a readout ("2 weeks"), a plain hint under it and the last 8 weeks as a
 * segmented timeline (oldest first): a week with a spot is a 2 px segment in the text colour, an
 * empty week a 1 px hairline in text-2. It reads like the progress line, not a meter.
 */
export function StreakReadout({ streak, testID = 'streak-readout' }: StreakReadoutProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const hint = streakHint(streak);
  const active = streak.lastWeeks.filter(Boolean).length;
  const hintText =
    hint === 'at_risk'
      ? t('progress.streak_at_risk', { count: streak.current })
      : hint === 'this_week'
        ? t('progress.streak_this_week', { best: streak.best })
        : hint === 'alive'
          ? t('progress.streak_alive')
          : t('progress.streak_start');

  return (
    <View style={styles.base} testID={testID}>
      <Readout
        value={String(streak.current)}
        suffix={t('progress.streak_unit', { count: streak.current })}
        meta={hintText}
        accessibilityLabel={t('progress.streak_weeks', { count: streak.current })}
        testID={`${testID}-figure`}
      />
      <View
        style={styles.chart}
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('progress.streak_chart_label', { active })}
        testID={`${testID}-chart`}
      >
        {streak.lastWeeks.map((isActive, index) => (
          <View
            key={index}
            style={[styles.bar, isActive ? styles.on : styles.off]}
            testID={isActive ? `${testID}-week-on` : `${testID}-week-off`}
          />
        ))}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: { gap: spacing.sm },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs, paddingTop: spacing.xs },
  bar: { flex: 1 },
  on: { height: lines.progress, backgroundColor: colors.text },
  off: { height: lines.hairline, backgroundColor: colors.text2 },
}));
