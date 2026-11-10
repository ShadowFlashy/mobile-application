import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, rowHeights, spacing, useMotion } from '../../theme';
import type { XpEntry } from '../../types/Progress';
import { countUpValue, toAchievementId, XP_COUNT_UP_MS } from '../../utils/revealTimeline';
import { Section } from '../primitives/Section';
import { Text } from '../primitives/Text';

export interface XpBreakdownProps {
  /** The XP ledger rows the spot earned, in ledger order. */
  entries: XpEntry[];
  /** Sum of the entries (RevealData.xpGained). */
  total: number;
  /** Count the total up from 0 (a quick ease-out; never with reduced motion). Default true. */
  animate?: boolean;
  /** Rows get `<testID>-row-<kind>`, the total `<testID>-total`. */
  testID?: string;
}

/** The total while it counts up; the final value at once with reduced motion or `animate={false}`. */
function useCountUp(target: number, animate: boolean): number {
  const { reduced } = useMotion();
  const run = animate && !reduced;
  const [value, setValue] = useState(() => (run ? 0 : target));

  useEffect(() => {
    if (!run) {
      setValue(target);
      return undefined;
    }
    let frame: number | undefined;
    const start = Date.now();
    const tick = () => {
      const next = countUpValue(target, Date.now() - start, XP_COUNT_UP_MS);
      setValue(next);
      if (next < target) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [run, target]);

  return value;
}

/**
 * The XP a spot earned as hairline rows (A): each source with its "+160 XP" in text-2, then the
 * total in condensed numerals, which counts up quickly. The total is always spoken as its final value.
 */
export function XpBreakdown({ entries, total, animate = true, testID }: XpBreakdownProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const shown = useCountUp(total, animate);

  const labelOf = (entry: XpEntry): string => {
    const achievement = entry.kind === 'achievement' ? toAchievementId(entry.ref) : undefined;
    if (achievement !== undefined) {
      return t('reveal.xp_achievement', { name: t(`achievements.${achievement}.title`) });
    }
    return t(`reveal.xp.${entry.kind}`);
  };

  return (
    <Section title={t('reveal.xp_title')} testID={testID}>
      {entries.map((entry, index) => (
        <View
          key={`${entry.kind}-${entry.ref ?? ''}-${index}`}
          style={[styles.row, styles.divider]}
          testID={testID !== undefined ? `${testID}-row-${entry.kind}` : undefined}
        >
          <View style={styles.label}>
            <Text variant="body" numberOfLines={1}>
              {labelOf(entry)}
            </Text>
          </View>
          <Text variant="numS" tone="text2" align="right">
            {t('reveal.xp_amount', { amount: entry.amount })}
          </Text>
        </View>
      ))}
      <View style={[styles.row, styles.total]}>
        <View style={styles.label}>
          <Text variant="heading">{t('reveal.xp_total')}</Text>
        </View>
        <Text
          variant="title"
          align="right"
          accessibilityLabel={t('reveal.xp_total_label', { amount: total })}
          testID={testID !== undefined ? `${testID}-total` : undefined}
        >
          {`+${shown}`}
          <Text variant="unit" tone="text2">{` ${t('reveal.xp_suffix')}`}</Text>
        </Text>
      </View>
    </Section>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    minHeight: rowHeights.compact,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.xs,
  },
  total: { minHeight: rowHeights.tall, alignItems: 'baseline', paddingTop: spacing.sm },
  divider: { borderBottomWidth: lines.hairline, borderBottomColor: colors.line },
  label: { flex: 1, minWidth: 0 },
}));
