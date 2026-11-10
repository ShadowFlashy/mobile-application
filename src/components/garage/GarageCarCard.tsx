import { useTranslation } from 'react-i18next';
import type { OwnerCar, OwnerCarStats } from '../../types/OwnerCar';
import { maskPlateHint } from '../../utils/plate';
import { ownerCarStatus } from '../../utils/verificationCode';
import { Badge } from '../primitives/Badge';
import { Icon } from '../primitives/Icon';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Text } from '../primitives/Text';
import { GarageStatusChip } from './GarageStatusChip';
import { VanityPlate } from './VanityPlate';

export interface GarageCarCardProps {
  car: OwnerCar;
  /** Server-side counters (get_owner_car_stats); undefined while loading. */
  stats?: OwnerCarStats;
  onPress: () => void;
}

/**
 * A car in the Garage: name, status chip (Pending, Verified or Paused), sightings and unread counts.
 * A pending car explains why it gets no pings yet.
 */
export function GarageCarCard({ car, stats, onPress }: GarageCarCardProps) {
  const { t } = useTranslation();
  const status = ownerCarStatus(car);
  const name = `${car.make} ${car.model}`;
  const sightings = stats?.sightings ?? 0;
  const unread = stats?.unread ?? 0;
  const sightingsLabel = t('garage.sightings', { count: sightings });

  return (
    <Surface
      variant="raised"
      radius="lg"
      padding="md"
      onPress={onPress}
      accessibilityLabel={t('garage.car_a11y', {
        car: car.nickname !== undefined ? `${name} ${t('garage.nickname', { nickname: car.nickname })}` : name,
        status: t(`garage.status_${status}`),
        sightings: sightingsLabel,
      })}
      testID={`garage-car-${car.id}`}
    >
      <Stack gap="smd">
        <Row justify="space-between" align="flex-start" gap="sm">
          <Stack gap="xxs" flex={1}>
            <Text variant="headline" numberOfLines={2}>
              {name}
            </Text>
            {car.nickname !== undefined && (
              <Text variant="bodySm" tone="muted">
                {t('garage.nickname', { nickname: car.nickname })}
              </Text>
            )}
          </Stack>
          <Icon name="chevron-forward" size={20} tone="muted" />
        </Row>

        <Row gap="sm" wrap align="center">
          <GarageStatusChip status={status} testID={`garage-car-status-${car.id}`} />
          {unread > 0 && (
            <Badge label={t('garage.unread', { count: unread })} tone="accent" testID={`garage-car-unread-${car.id}`} />
          )}
        </Row>

        {status === 'pending' ? (
          <Text variant="bodySm" tone="muted" testID={`garage-car-pending-${car.id}`}>
            {t('garage.pending_explanation')}
          </Text>
        ) : (
          <Stack gap="xxs">
            <Text variant="bodyStrong" testID={`garage-car-sightings-${car.id}`}>
              {sightingsLabel}
            </Text>
            {stats?.lastCity !== undefined && (
              <Text variant="bodySm" tone="muted">
                {t('garage.last_seen', { city: stats.lastCity })}
              </Text>
            )}
            {status === 'paused' && (
              <Text variant="bodySm" tone="muted">
                {t('garage.paused_explanation')}
              </Text>
            )}
          </Stack>
        )}

        {car.visibility === 'vanity' && car.plateDisplay !== undefined ? (
          <VanityPlate plate={car.plateDisplay} testID={`garage-car-plate-${car.id}`} />
        ) : (
          <Text variant="caption" tone="subtle">
            {t('garage.plate_hint', { plate: maskPlateHint(car.plateHint) })}
          </Text>
        )}
      </Stack>
    </Surface>
  );
}
