import { useTranslation } from 'react-i18next';
import type { OwnerCar, OwnerCarStats } from '../../types/OwnerCar';
import { ownerCarStatus } from '../../utils/verificationCode';
import { Readout } from '../primitives/Readout';
import { Row } from '../primitives/Row';
import { ScreenTitle } from '../primitives/ScreenTitle';
import { Stack } from '../primitives/Stack';
import { GarageStatus } from './GarageStatus';

export interface GarageCarHeaderProps {
  car: OwnerCar;
  stats?: OwnerCarStats;
}

/**
 * Header of the car settings: the car as the screen title, its status in words, and for a verified
 * car the server-side counters as readouts (sightings and new). A pending car has no counters.
 */
export function GarageCarHeader({ car, stats }: GarageCarHeaderProps) {
  const { t } = useTranslation();
  const status = ownerCarStatus(car);
  return (
    <Stack gap="md" testID="garage-car-header">
      <Stack gap="xs">
        <ScreenTitle title={`${car.make} ${car.model}`} testID="garage-car-title" />
        <GarageStatus status={status} testID="garage-car-header-status" />
      </Stack>
      {status !== 'pending' && (
        <Row gap="lg" align="flex-end">
          <Readout
            value={String(stats?.sightings ?? 0)}
            meta={t('garage.stat_sightings')}
            testID="garage-stat-sightings"
          />
          <Readout value={String(stats?.unread ?? 0)} meta={t('garage.stat_unread')} testID="garage-stat-unread" />
        </Row>
      )}
    </Stack>
  );
}
