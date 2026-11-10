import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, finishes, radii, spacing, useTheme } from '../theme';
import type { Rarity } from '../types/CarModel';
import { Text } from './primitives/Text';

interface RarityBadgeProps {
  rarity: Rarity;
}

/**
 * Rarity of a car model: a coloured chip with the translated name and 1–4 pips, so rarity is never
 * shown by colour alone.
 */
export function RarityBadge({ rarity }: RarityBadgeProps) {
  const { t } = useTranslation();
  const { rarity: palette } = useTheme();
  const styles = useStyles();
  const colours = palette[rarity];
  return (
    <View style={[styles.base, { backgroundColor: colours.background }]} testID={`rarity-${rarity}`}>
      <View style={styles.pips} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {Array.from({ length: finishes[rarity].pips }, (_, index) => (
          <View key={index} style={[styles.pip, { backgroundColor: colours.text }]} />
        ))}
      </View>
      <Text variant="label" color={colours.text}>
        {t(`rarity.${rarity}`)}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radii.sm,
  },
  pips: { flexDirection: 'row', gap: 2 },
  pip: { width: 5, height: 5, borderRadius: radii.pill, transform: [{ rotate: '45deg' }] },
}));
