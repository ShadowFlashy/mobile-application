import { router, Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../src/components/primitives/EmptyState';
import { Screen } from '../src/components/primitives/Screen';
import { StyledButton } from '../src/components/StyledButton';
import { routes } from '../src/constants/routes';

/** Unknown URL (e.g. a broken link in the PWA). Not signed in? The (app) layout sends you to login. */
export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <Screen title={t('not_found.title')} testID="not-found-screen">
      <RouterStack.Screen options={{ title: t('not_found.title') }} />
      <EmptyState
        icon="compass"
        title={t('not_found.heading')}
        description={t('not_found.description')}
        action={<StyledButton label={t('not_found.go_home')} onPress={() => router.replace(routes.home)} />}
        testID="not-found"
      />
    </Screen>
  );
}
