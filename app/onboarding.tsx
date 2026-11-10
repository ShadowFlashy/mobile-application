import { useTranslation } from 'react-i18next';
import { EmptyState } from '../src/components/primitives/EmptyState';
import { Screen } from '../src/components/primitives/Screen';

/** Placeholder route (F1, SPEC §5): W9 replaces it with the real screen. */
export default function OnboardingScreen() {
  const { t } = useTranslation();
  return (
    <Screen testID="onboarding-screen">
      <EmptyState icon="construct-outline" title={t('shell.onboarding_title')} description={t('shell.coming_soon')} />
    </Screen>
  );
}
