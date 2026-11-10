import { useTranslation } from 'react-i18next';
import { Text as RNText, View } from 'react-native';
import { borders, createThemedStyles, useTheme } from '../../theme';
import type { StreakInfo } from '../../types/Progress';
import { Icon } from '../primitives/Icon';

export interface StreakCounterProps {
  streak: StreakInfo;
  testID?: string;
}

/** Which hint to show under the streak. */
export type StreakHint = 'at_risk' | 'this_week' | 'alive' | 'start';

export function streakHint(streak: StreakInfo): StreakHint {
  const thisWeek = streak.lastWeeks[streak.lastWeeks.length - 1] === true;
  if (streak.atRisk) return 'at_risk';
  if (streak.current > 0 && thisWeek) return 'this_week';
  if (streak.current > 0) return 'alive';
  return 'start';
}

/**
 * The weekly streak: the current run in big numbers, the best run, an 8-week lap chart (oldest
 * first, this week outlined) and a hint, including the at-risk warning on Sunday.
 */
export function StreakCounter({ streak, testID = 'streak-counter' }: StreakCounterProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { colors } = useTheme();
  const hint = streakHint(streak);
  const active = streak.lastWeeks.filter(Boolean).length;
  const hintText =
    hint === 'at_risk'
      ? t('progress.streak_at_risk', { count: streak.current })
      : hint === 'this_week'
        ? t('progress.streak_this_week')
        : hint === 'alive'
          ? t('progress.streak_alive')
          : t('progress.streak_start');

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Icon name={streak.current > 0 ? 'flame' : 'flame-outline'} size={22} tone="accent" />
          <RNText style={styles.label}>{t('progress.streak_title')}</RNText>
        </View>
        <RNText style={styles.best}>{t('progress.streak_best', { count: streak.best })}</RNText>
      </View>
      <View style={styles.bodyRow}>
        {/* No big "0" in front of "No streak yet". */}
        {streak.current > 0 && (
          <RNText
            style={styles.count}
            testID={`${testID}-value`}
            accessibilityLabel={t('progress.streak_weeks', { count: streak.current })}
          >
            {String(streak.current)}
          </RNText>
        )}
        <RNText style={styles.unit}>{t('progress.streak_weeks', { count: streak.current })}</RNText>
      </View>
      <View
        style={styles.chart}
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('progress.streak_chart_label', { active })}
        testID={`${testID}-chart`}
      >
        {streak.lastWeeks.map((isActive, index) => {
          const isCurrent = index === streak.lastWeeks.length - 1;
          return (
            <View
              key={index}
              style={[styles.lap, isActive ? styles.lapOn : styles.lapOff, isCurrent && styles.lapCurrent]}
              testID={isActive ? `${testID}-week-on` : `${testID}-week-off`}
            >
              {isActive && <Icon name="checkmark" size={14} color={colors.onPrimary} />}
            </View>
          );
        })}
      </View>
      <RNText style={hint === 'at_risk' ? styles.hintRisk : styles.hint} testID={`${testID}-hint`}>
        {hintText}
      </RNText>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, instruments, text, spacing, radii }) => ({
  card: {
    backgroundColor: colors.surface,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.smd,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  label: { ...text.label, color: colors.text },
  best: { ...text.caption, color: colors.textMuted },
  bodyRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  count: { ...text.hero, color: colors.text },
  unit: { ...text.bodyStrong, color: colors.textMuted },
  chart: { flexDirection: 'row', gap: spacing.xs },
  lap: {
    flex: 1,
    height: 28,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borders.strong,
  },
  lapOn: { backgroundColor: instruments.timingGreen, borderColor: instruments.timingGreen },
  lapOff: { backgroundColor: colors.surfaceSunken, borderColor: colors.surfaceSunken },
  lapCurrent: { borderColor: colors.text },
  hint: { ...text.bodySm, color: colors.textMuted },
  hintRisk: { ...text.bodyStrong, color: colors.warning },
}));
