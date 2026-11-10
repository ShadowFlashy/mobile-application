import { useTranslation } from 'react-i18next';
import { EmptyState } from '../primitives/EmptyState';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { StyledButton } from '../StyledButton';

export interface NotACarCardProps {
  onRetake: () => void;
  onFillManually: () => void;
  testID?: string;
}

/** Co-Driver doesn't see a car (SPEC P0-06, §6.4): retake, or insist and fill in. Nothing is uploaded. */
export function NotACarCard({ onRetake, onFillManually, testID = 'not-a-car-card' }: NotACarCardProps) {
  const { t } = useTranslation();
  return (
    <Surface variant="stage" radius="lg" padding="md" testID={testID}>
      <EmptyState
        icon="eye-off-outline"
        tone="onStage"
        title={t('capture.not_a_car_title')}
        description={t('capture.not_a_car_body')}
        action={
          <Stack gap="sm">
            <StyledButton label={t('capture.retake')} icon="camera" onPress={onRetake} testID="retake-button" />
            <StyledButton
              label={t('capture.it_is_a_car')}
              variant="secondary"
              icon="create-outline"
              onPress={onFillManually}
              testID="it-is-a-car-button"
            />
          </Stack>
        }
      />
    </Surface>
  );
}
