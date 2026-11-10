import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { aspect, createThemedStyles, spacing } from '../../theme';
import type { Sighting } from '../../types/OwnerCar';
import { hourWindowLabel } from '../../utils/sightings';
import { Icon } from '../primitives/Icon';
import { PhotoFrame } from '../primitives/PhotoFrame';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Text } from '../primitives/Text';

export interface SightingCardProps {
  sighting: Sighting;
  onPress: () => void;
}

/**
 * One sighting in the Garage feed: the blurred photo, the car, the city and the hour window, plus
 * the spotter's name only if they chose to share it. Unread sightings carry a "New" label.
 */
export function SightingCard({ sighting, onPress }: SightingCardProps) {
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const hourWindow = hourWindowLabel(sighting.spottedHour, i18n.language);
  const place =
    sighting.city !== undefined ? t('sightings.spotted_in', { city: sighting.city }) : t('sightings.no_city');
  const a11y = sighting.isRead
    ? t('sightings.card_a11y', { car: sighting.carLabel, place, time: hourWindow })
    : t('sightings.card_a11y_unread', { car: sighting.carLabel, place, time: hourWindow });

  return (
    <Surface
      variant={sighting.isRead ? 'flat' : 'raised'}
      radius="lg"
      padding="sm"
      onPress={onPress}
      accessibilityLabel={a11y}
      testID={`sighting-${sighting.id}`}
    >
      <Row gap="smd" align="center">
        <View style={styles.thumb}>
          <PhotoFrame
            uri={sighting.photoUrl}
            cacheKey={sighting.photoPath}
            aspectRatio={aspect.photo}
            radius="stickerInner"
            accessibilityLabel={t('sightings.photo_a11y', { car: sighting.carLabel })}
          />
        </View>
        <Stack gap="xxs" flex={1}>
          <Row gap="xs" align="center" wrap>
            {!sighting.isRead && (
              <View style={styles.unread} testID={`sighting-unread-${sighting.id}`}>
                <Text variant="label" tone="onPrimary">
                  {t('sightings.unread')}
                </Text>
              </View>
            )}
            <Text variant="bodyStrong" numberOfLines={1}>
              {sighting.carLabel}
            </Text>
          </Row>
          <Row gap="xs" align="center">
            <Icon name="location-outline" size={14} tone="muted" />
            <Text variant="bodySm" tone="muted" numberOfLines={1}>
              {place}
            </Text>
          </Row>
          <Row gap="xs" align="center">
            <Icon name="time-outline" size={14} tone="muted" />
            <Text variant="numberSm" tone="muted">
              {hourWindow}
            </Text>
          </Row>
          {sighting.spotterName !== undefined && (
            <Text variant="caption" tone="subtle" numberOfLines={1}>
              {t('sightings.by_spotter', { name: sighting.spotterName })}
            </Text>
          )}
        </Stack>
        <Icon name="chevron-forward" size={18} tone="muted" />
      </Row>
    </Surface>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  thumb: { width: 96 },
  unread: {
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
  },
}));
