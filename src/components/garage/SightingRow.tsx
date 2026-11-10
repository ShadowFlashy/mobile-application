import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { aspect, columns, createThemedStyles, lines, radii, rowHeights, spacing } from '../../theme';
import type { Sighting } from '../../types/OwnerCar';
import { hourWindowLabel } from '../../utils/sightings';
import { PhotoFrame } from '../primitives/PhotoFrame';
import { Text } from '../primitives/Text';
import { UnreadDot } from './UnreadDot';

export interface SightingRowProps {
  sighting: Sighting;
  onPress: () => void;
}

const DOT_COLUMN = 8;

/**
 * One sighting in the Garage feed as a timing-tower row: when (the hour window, never the exact
 * time) · a 72 × 30 crop of the blurred photo · the car over the city, plus the spotter's name only
 * if they chose to share it. Unread sightings carry a small text-colour dot and say "New".
 */
export function SightingRow({ sighting, onPress }: SightingRowProps) {
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const hourWindow = hourWindowLabel(sighting.spottedHour, i18n.language);
  const place =
    sighting.city !== undefined ? t('sightings.spotted_in', { city: sighting.city }) : t('sightings.no_city');
  const a11y = sighting.isRead
    ? t('sightings.card_a11y', { car: sighting.carLabel, place, time: hourWindow })
    : t('sightings.card_a11y_unread', { car: sighting.carLabel, place, time: hourWindow });
  // "New" in words too, not only the dot.
  const subtitle = [
    sighting.isRead ? undefined : t('sightings.unread'),
    sighting.city ?? t('sightings.no_city'),
    sighting.spotterName !== undefined ? t('sightings.by_spotter', { name: sighting.spotterName }) : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID={`sighting-${sighting.id}`}
    >
      <View style={styles.when}>
        <View style={styles.dot}>{!sighting.isRead && <UnreadDot testID={`sighting-unread-${sighting.id}`} />}</View>
        <Text variant="numS" tone={sighting.isRead ? 'text2' : 'text'} numberOfLines={1}>
          {hourWindow}
        </Text>
      </View>
      <View style={styles.thumb}>
        <PhotoFrame
          uri={sighting.photoUrl}
          cacheKey={sighting.photoPath}
          aspectRatio={aspect.thumb}
          radius="none"
          accessibilityLabel={t('sightings.photo_a11y', { car: sighting.carLabel })}
        />
      </View>
      <View style={styles.text}>
        <Text variant="body" numberOfLines={1}>
          {sighting.carLabel}
        </Text>
        <Text variant="meta" tone="text2" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    minHeight: rowHeights.tall,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  pressed: { backgroundColor: colors.raise },
  when: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 0 },
  dot: { width: DOT_COLUMN, alignItems: 'center' },
  thumb: { width: columns.thumb, flexShrink: 0, overflow: 'hidden', borderRadius: radii.xs },
  text: { flex: 1, minWidth: 0 },
}));
