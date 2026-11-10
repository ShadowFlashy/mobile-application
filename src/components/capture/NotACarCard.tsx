import { useTranslation } from 'react-i18next';
import { Stack } from '../primitives/Stack';
import { StyledButton } from '../StyledButton';
import { StatusRow } from './StatusRow';

export interface NotACarCardProps {
  onRetake: () => void;
  onFillManually: () => void;
  testID?: string;
}

/** Auto-fill doesn't see a car (SPEC P0-06, §6.4): retake, or insist and fill in. Nothing is uploaded. */
export function NotACarCard({ onRetake, onFillManually, testID = 'not-a-car-card' }: NotACarCardProps) {
  const { t } = useTranslation();
  return (
    <Stack gap="md" testID={testID}>
      <StatusRow icon="eye-off" title={t('capture.not_a_car_title')} body={t('capture.not_a_car_body')} />
      <Stack gap="sm">
        <StyledButton label={t('capture.retake')} icon="camera" onPress={onRetake} testID="retake-button" />
        <StyledButton
          label={t('capture.it_is_a_car')}
          variant="secondary"
          onPress={onFillManually}
          testID="it-is-a-car-button"
        />
      </Stack>
    </Stack>
  );
}
