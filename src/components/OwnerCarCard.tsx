import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import type { OwnerCar } from '../types/OwnerCar';
import { maskPlateHint } from '../utils/plate';
import { Badge } from './primitives/Badge';
import { Card } from './primitives/Card';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';
import { StyledButton } from './StyledButton';
import { VanityPlate } from './VanityPlate';

interface OwnerCarCardProps {
  car: OwnerCar;
  spotCount: number;
  onTogglePlate: () => void;
  onRemove: () => void;
}

/** A car registered in the owner portal, with its plate privacy setting. */
export function OwnerCarCard({ car, spotCount, onTogglePlate, onRemove }: OwnerCarCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Card testID={`owner-car-${car.id}`}>
      <Stack gap="md" padding="md">
        <Row justify="space-between" align="flex-start" gap="sm">
          <Stack gap="xs" flex={1}>
            <Text size="lg" weight="bold">
              {car.make} {car.model}
            </Text>
            {car.nickname !== undefined && (
              <Text color={colors.textMuted}>{t('owner_car.nickname', { nickname: car.nickname })}</Text>
            )}
          </Stack>
          <Badge label={t('owner_car.spotted', { count: spotCount })} variant={spotCount > 0 ? 'primary' : 'default'} />
        </Row>
        {car.showPlate && car.plateDisplay !== undefined ? (
          <Stack gap="xs">
            <VanityPlate plate={car.plateDisplay} />
            <Text size="sm" color={colors.textMuted}>
              {t('owner_car.plate_shown')}
            </Text>
          </Stack>
        ) : (
          <Text size="sm" color={colors.textMuted}>
            {t('owner_car.plate_hidden', { plate: maskPlateHint(car.plateHint) })}
          </Text>
        )}
        <Row gap="sm" wrap>
          <StyledButton
            label={car.showPlate ? t('owner_car.hide_plate') : t('owner_car.show_plate')}
            onPress={onTogglePlate}
            variant="secondary"
            testID={`toggle-plate-${car.id}`}
          />
          <StyledButton
            label={t('common.remove')}
            onPress={onRemove}
            variant="ghost"
            icon="trash-outline"
            testID={`remove-car-${car.id}`}
          />
        </Row>
      </Stack>
    </Card>
  );
}
