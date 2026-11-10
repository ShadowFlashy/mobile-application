import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { columns, createThemedStyles, lines, rowHeights, spacing } from '../../theme';
import type { ChallengeProgress } from '../../types/Progress';
import { Icon } from '../primitives/Icon';
import { Text } from '../primitives/Text';
import { useChallengeText } from './challengeText';

export interface ChallengeRowProps {
  challenge: ChallengeProgress;
  /** The bottom hairline. Default true. */
  divider?: boolean;
  /** Default `challenge-<slot>`; the count gets `<testID>-progress`, the check `<testID>-done`. */
  testID?: string;
}

/** Width of the count column ("2/3" or the check) and of the XP column ("+250 XP"). */

/**
 * A weekly challenge as one 40 px hairline row (A-Album "This week"): the task, the count in
 * condensed numerals and the XP in text-2. A finished challenge shows a check in the count column and
 * its task turns text-2, so it recedes. The row reads as one sentence to a screen reader.
 */
export function ChallengeRow({ challenge, divider = true, testID }: ChallengeRowProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { describe, slotLabel } = useChallengeText();
  const { slot, target, xp } = challenge.challenge;
  const id = testID ?? `challenge-${slot}`;
  const description = describe(challenge.challenge);
  const value = Math.min(challenge.value, target);
  const done = challenge.isComplete;
  const label = done
    ? t('progress.board_label_done', { slot: slotLabel(slot), description, xp })
    : t('progress.board_label', { slot: slotLabel(slot), description, value, target, xp });

  return (
    <View style={[styles.row, divider && styles.divider]} accessible accessibilityLabel={label} testID={id}>
      <View style={styles.task}>
        <Text variant="body" tone={done ? 'text2' : 'text'} numberOfLines={2}>
          {description}
        </Text>
      </View>
      <View style={styles.count}>
        {done ? (
          <View testID={`${id}-done`}>
            <Icon name="check" size={20} />
          </View>
        ) : (
          <Text variant="num" align="right" testID={`${id}-progress`}>
            {t('progress.board_progress', { value, target })}
          </Text>
        )}
      </View>
      <View style={styles.xp}>
        <Text variant="numS" tone="text2" align="right" numberOfLines={1}>
          {t('progress.board_xp', { xp })}
        </Text>
      </View>
    </View>
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
  divider: { borderBottomWidth: lines.hairline, borderBottomColor: colors.line },
  task: { flex: 1, minWidth: 0 },
  count: { minWidth: columns.count, alignItems: 'flex-end', justifyContent: 'center' },
  xp: { minWidth: columns.xp, alignItems: 'flex-end' },
}));
