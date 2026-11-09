import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { I18nManager, View } from 'react-native';
import { createThemedStyles, radii, useTheme } from '../theme';
import type { Spot } from '../types/Spot';
import { formatRelativeDate } from '../utils/formatDate';
import { Card } from './primitives/Card';
import { Icon } from './primitives/Icon';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';

interface SpotCardProps {
  spot: Spot;
  onPress: () => void;
}

/** Compact list row for a spot: thumbnail, car name, when and where. */
export function SpotCard({ spot, onPress }: SpotCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const name = `${spot.make} ${spot.model}`;
  const when = formatRelativeDate(spot.spottedAt, i18n.language);
  const location = spot.locationLabel;

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={
        location !== undefined
          ? t('ui.spot_card_location_a11y', { name, when, location })
          : t('ui.spot_card_a11y', { name, when })
      }
      testID={`spot-card-${spot.id}`}
    >
      <Stack padding="sm">
        <Row gap="md">
          <View style={styles.thumbnail}>
            {spot.photoUrl !== undefined ? (
              <Image
                source={{ uri: spot.photoUrl, cacheKey: spot.photoPath }}
                contentFit="cover"
                style={styles.image}
                accessibilityLabel={t('ui.car_photo_a11y', { name })}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <Icon name="car-sport-outline" size={28} color={colors.textSubtle} />
            )}
          </View>
          <Stack gap="xs" flex={1}>
            <Text weight="bold" numberOfLines={1}>
              {name}
            </Text>
            <Text size="sm" color={colors.textMuted} numberOfLines={1}>
              {location !== undefined ? t('ui.spot_card_meta', { when, location }) : when}
            </Text>
          </Stack>
          <Icon name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textSubtle} />
        </Row>
      </Stack>
    </Card>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
}));
