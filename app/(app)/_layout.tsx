import { Redirect, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../src/components/primitives/Screen';
import { Spinner } from '../../src/components/primitives/Spinner';
import { Stack as VStack } from '../../src/components/primitives/Stack';
import { routes } from '../../src/constants/routes';
import { usePingSubscription } from '../../src/hooks/usePings';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useTheme } from '../../src/theme';

/**
 * Everything inside (app) requires a signed-in user. Navigation follows the auth state: after
 * logging out (or deleting the account) this layout redirects to the login screen by itself.
 */
export default function AppLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);

  // Live pings for the owner portal. Called before the early returns: hooks always run in the same order.
  usePingSubscription(userId);

  if (!isInitialized) {
    return (
      <Screen scrollable={false}>
        <VStack flex={1} align="center" justify="center">
          <Spinner size="large" testID="app-loading" />
        </VStack>
      </Screen>
    );
  }

  if (!isAuthenticated) return <Redirect href={routes.login} />;

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.accent,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="details/[id]" options={{ title: t('shell.spot_title') }} />
      <Stack.Screen name="sticker/[id]" options={{ title: t('shell.sticker_title') }} />
    </Stack>
  );
}
