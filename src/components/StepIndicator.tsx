import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, radii } from '../theme';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';

interface StepIndicatorProps {
  /** Already translated step names, in order. */
  steps: string[];
  currentIndex: number;
}

/** Shows where the user is in a multi-step flow, like a row of shift lights. */
export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <Stack gap="xs" testID="step-indicator">
      <Row gap="xs">
        {steps.map((step, index) => (
          <View
            key={step}
            style={[
              styles.segment,
              index < currentIndex && styles.done,
              index === currentIndex && styles.current,
              index > currentIndex && styles.todo,
            ]}
          />
        ))}
      </Row>
      <Text variant="label" tone="muted" testID="step-indicator-label">
        {t('ui.step_progress', {
          current: currentIndex + 1,
          total: steps.length,
          step: steps[currentIndex] ?? '',
        })}
      </Text>
    </Stack>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  segment: { flex: 1, height: 6, borderRadius: radii.pill },
  done: { backgroundColor: colors.successFill },
  current: { backgroundColor: colors.primary },
  todo: { backgroundColor: colors.surfaceSunken },
}));
