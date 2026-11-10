import { useTranslation } from 'react-i18next';
import { ProgressBar } from './primitives/ProgressBar';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';

interface StepIndicatorProps {
  /** Already translated step names, in order. */
  steps: string[];
  currentIndex: number;
}

/** Where the user is in a multi-step flow: A's 2 px progress line and a "Step 2 of 3" meta line. */
export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  const { t } = useTranslation();
  const total = Math.max(steps.length, 1);
  const label = t('ui.step_progress', {
    current: currentIndex + 1,
    total: steps.length,
    step: steps[currentIndex] ?? '',
  });
  return (
    <Stack gap="sm" testID="step-indicator">
      <ProgressBar progress={(currentIndex + 1) / total} label={label} />
      <Text variant="meta" tone="text2" testID="step-indicator-label">
        {label}
      </Text>
    </Stack>
  );
}
