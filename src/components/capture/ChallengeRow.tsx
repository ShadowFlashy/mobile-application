import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, rowHeights, spacing } from '../../theme';
import { Text } from '../primitives/Text';

export interface ChallengeRowProps {
  /** The translated challenge, e.g. "Spot 1 car in orange". */
  challenge: string;
  /** XP the challenge earns. */
  xp: number;
  testID?: string;
}

/** A plain row of the review's "Car" section: "Completes Spot 1 car in orange" with "+125 XP". */
export function ChallengeRow({ challenge, xp, testID = 'challenge-row' }: ChallengeRowProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.row} testID={testID}>
      <View style={styles.text}>
        <Text variant="body" tone="text2" numberOfLines={2}>
          {`${t('capture.completes')} `}
          <Text variant="body">{challenge}</Text>
        </Text>
      </View>
      <Text variant="numS">{t('capture.xp_value', { xp })}</Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    minHeight: rowHeights.default,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.xs,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  text: { flex: 1, minWidth: 0 },
}));
