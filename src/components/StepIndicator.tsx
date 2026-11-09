import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, radii, useTheme } from '../theme';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';

interface StepIndicatorProps {
  /** Already translated step names, in order. */
  steps: string[];
  currentIndex: number;
}

/** Shows where the user is in a multi-step flow, so they never feel lost (course ch. 3). */
export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Stack gap="xs" testID="step-indicator">
      <Row gap="xs">
        {steps.map((step, index) => (
          <View
            key={step}
            style={[styles.segment, index <= currentIndex ? styles.segmentActive : styles.segmentInactive]}
          />
        ))}
      </Row>
      <Text size="sm" color={colors.textMuted} testID="step-indicator-label">
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
  segment: { flex: 1, height: 4, borderRadius: radii.pill },
  segmentActive: { backgroundColor: colors.primary },
  segmentInactive: { backgroundColor: colors.border },
}));
