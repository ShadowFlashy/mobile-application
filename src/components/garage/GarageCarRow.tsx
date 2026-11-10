import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { createThemedStyles, lines, rowHeights, spacing } from '../../theme';
import type { OwnerCar, OwnerCarStats } from '../../types/OwnerCar';
import { maskPlateHint } from '../../utils/plate';
import { ownerCarStatus } from '../../utils/verificationCode';
import { Icon } from '../primitives/Icon';
import { Text } from '../primitives/Text';
import { GarageStatus } from './GarageStatus';
import { UnreadDot } from './UnreadDot';
import { VanityPlate } from './VanityPlate';

export interface GarageCarRowProps {
  car: OwnerCar;
  /** Server-side counters (get_owner_car_stats); undefined while loading. */
  stats?: OwnerCarStats;
  onPress: () => void;
}

/**
 * A car in the Garage as one hairline row: the name (and nickname), the status in words with the
 * plate as the privacy rules allow (masked, or the vanity plate the owner chose to show), and the
 * counters or the reason a pending car gets no pings yet. New sightings show a dot and a count.
 */
export function GarageCarRow({ car, stats, onPress }: GarageCarRowProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const status = ownerCarStatus(car);
  const name = `${car.make} ${car.model}`;
  const nickname = car.nickname !== undefined ? t('garage.nickname', { nickname: car.nickname }) : undefined;
  const sightings = stats?.sightings ?? 0;
  const unread = stats?.unread ?? 0;
  const sightingsLabel = t('garage.sightings', { count: sightings });
  const a11y = [
    t('garage.car_a11y', {
      car: nickname !== undefined ? `${name} ${nickname}` : name,
      status: t(`garage.status_${status}`),
      sightings: sightingsLabel,
    }),
    unread > 0 ? t('garage.unread_a11y', { count: unread }) : undefined,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID={`garage-car-${car.id}`}
    >
      <View style={styles.text}>
        <Text variant="bodyL" numberOfLines={2}>
          {name}
          {nickname !== undefined && <Text variant="bodyL" tone="text2">{` ${nickname}`}</Text>}
        </Text>
        <View style={styles.line}>
          <GarageStatus status={status} testID={`garage-car-status-${car.id}`} />
          {car.visibility === 'vanity' && car.plateDisplay !== undefined ? (
            <VanityPlate plate={car.plateDisplay} testID={`garage-car-plate-${car.id}`} />
          ) : (
            <Text variant="meta" tone="text2" numberOfLines={1}>
              {t('garage.plate_hint', { plate: maskPlateHint(car.plateHint) })}
            </Text>
          )}
        </View>
        {status === 'pending' ? (
          <Text variant="meta" tone="text2" testID={`garage-car-pending-${car.id}`}>
            {t('garage.pending_explanation')}
          </Text>
        ) : (
          <View style={styles.line}>
            <Text variant="meta" tone="text2" testID={`garage-car-sightings-${car.id}`}>
              {sightingsLabel}
            </Text>
            {stats?.lastCity !== undefined && (
              <Text variant="meta" tone="text2" numberOfLines={1}>
                {t('garage.last_seen', { city: stats.lastCity })}
              </Text>
            )}
          </View>
        )}
        {status === 'paused' && (
          <Text variant="meta" tone="text2">
            {t('garage.paused_explanation')}
          </Text>
        )}
      </View>
      <View style={styles.trailing}>
        {unread > 0 && (
          <View style={styles.unread} testID={`garage-car-unread-${car.id}`}>
            <UnreadDot />
            <Text variant="body">{t('garage.unread', { count: unread })}</Text>
          </View>
        )}
        <Icon name="chevron-right" size={20} tone="text2" />
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
    paddingVertical: spacing.smd,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  pressed: { backgroundColor: colors.raise },
  text: { flex: 1, minWidth: 0, gap: spacing.xs },
  line: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.smd, rowGap: spacing.xs },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 0 },
  unread: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
}));
