import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, useTheme } from '../../theme';
import type { XpEntry } from '../../types/Progress';
import { toAchievementId, xpTiming, type TimingColor } from '../../utils/revealTimeline';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { OdometerCounter } from './OdometerCounter';

export interface XpBreakdownProps {
  /** The XP ledger rows the spot earned, in ledger order. */
  entries: XpEntry[];
  /** Sum of the entries (RevealData.xpGained). */
  total: number;
  /** Roll the odometer total up from 0. Default true. */
  animate?: boolean;
  /** The total gets `<testID>-total`. */
  testID?: string;
}

/**
 * The XP rows of a reveal in timing-screen colours (purple = a first, green = streaks, challenges
 * and plaques, yellow = the rest) and the odometer total (SPEC P0-15 step 4). The colour is never
 * the only signal: every row is labelled.
 */
export function XpBreakdown({ entries, total, animate = true, testID }: XpBreakdownProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { colors, instruments } = useTheme();
  const inkOf = (timing: TimingColor): string => (timing === 'yellow' ? instruments.timingYellowInk : colors.onPrimary);

  const labelOf = (entry: XpEntry): string => {
    const achievement = entry.kind === 'achievement' ? toAchievementId(entry.ref) : undefined;
    if (achievement !== undefined) {
      return t('reveal.xp_achievement', { name: t(`reveal.achievement_names.${achievement}`) });
    }
    return t(`reveal.xp.${entry.kind}`);
  };

  return (
    <View style={styles.board} testID={testID}>
      <Stack gap="sm">
        <Text variant="label" tone="onStageMuted">
          {t('reveal.xp_title')}
        </Text>
        {entries.map((entry, index) => (
          <Row
            key={`${entry.kind}-${entry.ref ?? ''}-${index}`}
            justify="space-between"
            gap="sm"
            testID={testID !== undefined ? `${testID}-row-${entry.kind}` : undefined}
          >
            <Row gap="sm" flex={1}>
              <View style={[styles.flag, styles[xpTiming(entry.kind)]]} />
              <Text tone="onStage" numberOfLines={1}>
                {labelOf(entry)}
              </Text>
            </Row>
            <View style={[styles.pill, styles[xpTiming(entry.kind)]]}>
              <Text variant="numberSm" color={inkOf(xpTiming(entry.kind))}>
                {t('reveal.xp_amount', { amount: entry.amount })}
              </Text>
            </View>
          </Row>
        ))}
        <View style={styles.rule} />
        <Row justify="space-between" align="flex-end">
          <Text variant="title" tone="onStage">
            {t('reveal.xp_total')}
          </Text>
          <OdometerCounter
            value={total}
            animateFrom={animate ? 0 : undefined}
            suffix={t('reveal.xp_suffix')}
            tone="onStage"
            testID={testID !== undefined ? `${testID}-total` : undefined}
          />
        </Row>
      </Stack>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, instruments, radii, spacing }) => ({
  board: {
    backgroundColor: instruments.pitBoard,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  flag: { width: 4, height: 20, borderRadius: radii.sm },
  pill: { borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  purple: { backgroundColor: instruments.timingPurple },
  green: { backgroundColor: instruments.timingGreen },
  yellow: { backgroundColor: instruments.timingYellow },
  rule: { height: 1, backgroundColor: colors.onStageMuted, opacity: 0.4 },
}));
