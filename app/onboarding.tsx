import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Row } from '../src/components/primitives/Row';
import { Screen } from '../src/components/primitives/Screen';
import { Stack } from '../src/components/primitives/Stack';
import { Text } from '../src/components/primitives/Text';
import { StepIndicator } from '../src/components/StepIndicator';
import { StyledButton } from '../src/components/StyledButton';
import { routes } from '../src/constants/routes';

/** The three steps, in order: a short name for the step line, a title and a paragraph. */
const STEPS = [
  { id: 'spot', name: 'onboarding.step_spot', title: 'onboarding.spot_title', body: 'onboarding.spot_body' },
  { id: 'blur', name: 'onboarding.step_blur', title: 'onboarding.blur_title', body: 'onboarding.blur_body' },
  {
    id: 'collect',
    name: 'onboarding.step_collect',
    title: 'onboarding.collect_title',
    body: 'onboarding.collect_body',
  },
] as const;

/**
 * A short introduction in three plain steps (spot, blur, collect) with A's 2 px progress line.
 * "Skip" and the last step open the album; signed-out visitors are sent on to the login screen.
 */
export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const step = STEPS[Math.min(index, STEPS.length - 1)];
  const isFirst = index === 0;
  const isLast = index >= STEPS.length - 1;
  const finish = () => router.replace(routes.home);

  return (
    <Screen
      title={t(step.title)}
      testID="onboarding-screen"
      footer={
        <Row gap="md" align="center" justify="space-between">
          <StyledButton
            label={isFirst ? t('onboarding.skip') : t('onboarding.back')}
            variant="text"
            onPress={isFirst ? finish : () => setIndex(index - 1)}
            testID={isFirst ? 'onboarding-skip' : 'onboarding-back'}
          />
          <StyledButton
            label={isLast ? t('onboarding.done') : t('onboarding.next')}
            onPress={isLast ? finish : () => setIndex(index + 1)}
            testID={isLast ? 'onboarding-done' : 'onboarding-next'}
          />
        </Row>
      }
    >
      <Stack gap="lg">
        <Stack testID={`onboarding-step-${step.id}`}>
          <Text variant="bodyL" tone="text2">
            {t(step.body)}
          </Text>
        </Stack>
        <StepIndicator steps={STEPS.map((item) => t(item.name))} currentIndex={index} />
      </Stack>
    </Screen>
  );
}
