import { useTranslation } from 'react-i18next';
import type { OwnerCar, OwnerCarStats } from '../../types/OwnerCar';
import { maskPlateHint } from '../../utils/plate';
import { ownerCarStatus } from '../../utils/verificationCode';
import { KerbStripe } from '../primitives/KerbStripe';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { StatTile } from '../StatTile';
import { GarageStatusChip } from './GarageStatusChip';
import { VanityPlate } from './VanityPlate';

export interface GarageCarHeaderProps {
  car: OwnerCar;
  stats?: OwnerCarStats;
}

/** Hero of the car settings: name, status, plate and the server-side counters. */
export function GarageCarHeader({ car, stats }: GarageCarHeaderProps) {
  const { t } = useTranslation();
  const status = ownerCarStatus(car);
  return (
    <Stack gap="md" testID="garage-car-header">
      <Stack gap="xs">
        <Text variant="label" tone="accent">
          {t('garage.eyebrow')}
        </Text>
        <Text variant="display" heading>
          {car.make} {car.model}
        </Text>
        {car.nickname !== undefined && (
          <Text variant="body" tone="muted">
            {t('garage.nickname', { nickname: car.nickname })}
          </Text>
        )}
      </Stack>
      <KerbStripe />
      <Row gap="sm" wrap align="center" justify="space-between">
        <GarageStatusChip status={status} testID="garage-car-header-status" />
        {car.visibility === 'vanity' && car.plateDisplay !== undefined ? (
          <VanityPlate plate={car.plateDisplay} size="lg" />
        ) : (
          <Text variant="caption" tone="subtle">
            {t('garage.plate_hint', { plate: maskPlateHint(car.plateHint) })}
          </Text>
        )}
      </Row>
      {status !== 'pending' && (
        <Row gap="sm" wrap>
          <Stack flex={1}>
            <StatTile
              label={t('garage.stat_sightings')}
              value={String(stats?.sightings ?? 0)}
              icon="eye-outline"
              testID="garage-stat-sightings"
            />
          </Stack>
          <Stack flex={1}>
            <StatTile
              label={t('garage.stat_unread')}
              value={String(stats?.unread ?? 0)}
              icon="notifications-outline"
              testID="garage-stat-unread"
            />
          </Stack>
          <Stack flex={1}>
            <StatTile
              label={t('garage.stat_last_city')}
              value={stats?.lastCity ?? t('garage.stat_none')}
              icon="location-outline"
              valueVariant="headline"
              testID="garage-stat-city"
            />
          </Stack>
        </Row>
      )}
    </Stack>
  );
}
