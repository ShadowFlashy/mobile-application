import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, ROUNDEL_OUTER, ROUNDEL_SIZE, spacing, useTheme } from '../../theme';
import type { Rarity } from '../../types/CarModel';
import { Text } from './Text';

interface RarityRoundelProps {
  rarity: Rarity;
  /** Spells the tier in meta / text-2 before the roundel ("Epic ⓔ"), where there is room. */
  showLabel?: boolean;
  /** `onStage` on the always-dark photo stage. */
  tone?: 'default' | 'onStage';
  testID?: string;
}

/**
 * Rarity as a small monochrome roundel with the tier letter, read like an F1 tyre compound:
 * C a text-2 ring, R a text ring, E a solid text disc, L the E disc plus an outer ring. The tier
 * word is always the accessible label, so the letters never have to be learned to be understood.
 */
export function RarityRoundel({ rarity, showLabel = false, tone = 'default', testID }: RarityRoundelProps) {
  const { t } = useTranslation();
  const { colors, roundels } = useTheme();
  const styles = useStyles();
  const style = roundels[rarity];
  const onStage = tone === 'onStage';
  // On the stage the roundel uses the stage's own light ink instead of the scheme's text colour.
  const resolve = (token: keyof typeof colors | undefined): string | undefined => {
    if (token === undefined) return undefined;
    if (!onStage) return colors[token];
    if (token === 'text2') return colors.onStageMuted;
    if (token === 'onInverse') return colors.stage;
    return colors.onStage;
  };
  const ring = resolve(style.ring);
  const fill = resolve(style.fill);
  const ink = resolve(style.ink);
  const word = t(`rarity.${rarity}`);

  const disc = (
    <View
      style={[
        styles.disc,
        ring !== undefined && { borderWidth: lines.ring, borderColor: ring },
        fill !== undefined && { backgroundColor: fill },
      ]}
    >
      <Text variant="mark" color={ink} decorative>
        {t(`rarity.letter_${rarity}`)}
      </Text>
    </View>
  );

  return (
    <View style={styles.row} accessible accessibilityRole="image" accessibilityLabel={word} testID={testID}>
      {showLabel && (
        <Text variant="meta" tone={onStage ? 'onStageMuted' : 'text2'} decorative>
          {word}
        </Text>
      )}
      {style.outerRing ? (
        <View style={[styles.outer, { borderColor: onStage ? colors.onStage : colors.text }]}>{disc}</View>
      ) : (
        disc
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ radii }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  disc: {
    width: ROUNDEL_SIZE,
    height: ROUNDEL_SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outer: {
    width: ROUNDEL_OUTER,
    height: ROUNDEL_OUTER,
    borderRadius: radii.pill,
    borderWidth: lines.ring,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
