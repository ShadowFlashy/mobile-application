import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { radii, spacing } from '../theme';
import { Text } from './primitives/Text';

/**
 * Fixed look of a Belgian licence plate: white plate, burgundy characters and a blue EU band.
 * A real plate looks the same in light and dark mode, so these are the only literal colours in
 * the app and they deliberately do not come from the theme.
 */
const PLATE_COLORS = {
  plate: '#FFFFFF',
  characters: '#9F1239',
  euBand: '#1D4ED8',
  euBandText: '#FFFFFF',
};

/** Country code printed on the EU band: part of the plate design, not translatable text. */
const COUNTRY_CODE = 'B';

interface VanityPlateProps {
  plate: string;
}

/**
 * A plate the owner explicitly chose to show (vanity plate), styled like a Belgian plate.
 * Plates are never shown unless their owner opted in through the owner portal.
 */
export function VanityPlate({ plate }: VanityPlateProps) {
  const { t } = useTranslation();
  return (
    <View
      style={styles.plate}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('ui.vanity_plate_a11y', { plate })}
    >
      <View style={styles.euBand}>
        <Text size="sm" weight="bold" color={PLATE_COLORS.euBandText}>
          {COUNTRY_CODE}
        </Text>
      </View>
      <View style={styles.characters}>
        <Text size="lg" weight="bold" color={PLATE_COLORS.characters}>
          {plate}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    flexDirection: 'row',
    // A plate keeps its EU band on the left, also in right-to-left languages.
    direction: 'ltr',
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: PLATE_COLORS.characters,
    borderRadius: radii.sm,
    backgroundColor: PLATE_COLORS.plate,
    overflow: 'hidden',
  },
  euBand: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
    backgroundColor: PLATE_COLORS.euBand,
  },
  characters: { paddingHorizontal: spacing.sm, paddingVertical: 2 },
});
