import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { borders, createThemedStyles, spacing, useTheme } from '../../theme';
import { Text } from '../primitives/Text';

/** Country code printed on the EU band: part of the plate design, not translatable text. */
const COUNTRY_CODE = 'B';

export interface VanityPlateProps {
  plate: string;
  /** `md` in cards and on spots, `lg` as the hero of the car settings. */
  size?: 'md' | 'lg';
  testID?: string;
}

/**
 * A plate the owner explicitly chose to show (visibility "vanity"), drawn like a Belgian plate:
 * white plate, burgundy characters and the blue EU band. A real plate looks the same in light and
 * dark mode, so its colours come from the fixed `plate` tokens (src/theme/plate.ts).
 */
export function VanityPlate({ plate, size = 'md', testID = 'vanity-plate' }: VanityPlateProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();
  return (
    <View
      style={[styles.plate, size === 'lg' && styles.plateLarge]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('garage.vanity_plate_a11y', { plate })}
      testID={testID}
    >
      <View style={styles.band}>
        <Text variant="label" color={theme.plate.bandInk}>
          {COUNTRY_CODE}
        </Text>
      </View>
      <View style={[styles.characters, size === 'lg' && styles.charactersLarge]}>
        <Text variant={size === 'lg' ? 'title' : 'headline'} color={theme.plate.ink} numberOfLines={1}>
          {plate}
        </Text>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ plate, radii }) => ({
  plate: {
    flexDirection: 'row',
    // A plate keeps its EU band on the left, also in right-to-left languages.
    direction: 'ltr',
    alignSelf: 'flex-start',
    minHeight: 36,
    borderWidth: borders.strong,
    borderColor: plate.border,
    borderRadius: radii.sm,
    backgroundColor: plate.background,
    overflow: 'hidden',
  },
  plateLarge: { minHeight: 52 },
  band: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xxs,
    backgroundColor: plate.band,
  },
  characters: { justifyContent: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  charactersLarge: { paddingHorizontal: spacing.md },
}));
