import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, radii, spacing } from '../../theme';
import { Text } from '../primitives/Text';

export interface VanityPlateProps {
  plate: string;
  /** `md` in rows and on spots, `lg` in the car settings header. */
  size?: 'md' | 'lg';
  testID?: string;
}

/**
 * A plate the owner explicitly chose to show (visibility "vanity"), drawn flat: the characters in
 * condensed numerals inside a 1 px text-colour box with a 2 px radius. No band or plate colours.
 */
export function VanityPlate({ plate, size = 'md', testID = 'vanity-plate' }: VanityPlateProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View
      style={[styles.plate, size === 'lg' && styles.plateLarge]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('garage.vanity_plate_a11y', { plate })}
      testID={testID}
    >
      <Text variant={size === 'lg' ? 'unit' : 'num'} numberOfLines={1}>
        {plate}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  plate: {
    // A plate reads left to right, also in right-to-left languages.
    direction: 'ltr',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.none,
    borderWidth: lines.hairline,
    borderColor: colors.text,
    borderRadius: radii.xs,
  },
  plateLarge: { paddingHorizontal: spacing.smd, paddingVertical: spacing.xs },
}));
