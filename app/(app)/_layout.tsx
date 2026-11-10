import { Redirect, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../src/components/primitives/Screen';
import { Spinner } from '../../src/components/primitives/Spinner';
import { Stack as VStack } from '../../src/components/primitives/Stack';
import { routes } from '../../src/constants/routes';
import { usePingSubscription } from '../../src/hooks/usePings';
import { useAuthStore } from '../../src/state/useAuthStore';
import { useNavigatorTheme } from '../../src/theme';

/**
 * The tabs sit under every stack screen, so a deep link (e.g. /album/sports) still has a way back,
 * and the URL does not jump to another (app) route while the auth spinner is showing.
 */
export const unstable_settings = { initialRouteName: '(tabs)' };

/**
 * Everything inside (app) requires a signed-in user. Navigation follows the auth state: after
 * logging out (or deleting the account) this layout redirects to the login screen by itself.
 */
export default function AppLayout() {
  const { t } = useTranslation();
  const { stack } = useNavigatorTheme();
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
    <Stack screenOptions={stack}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="capture" options={{ presentation: 'fullScreenModal', headerShown: false }} />
      <Stack.Screen
        name="reveal/[spotId]"
        options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="album/[page]" options={{ title: t('shell.album_title') }} />
      <Stack.Screen name="album/collection/[id]" options={{ title: t('shell.collection_title') }} />
      <Stack.Screen name="sticker/[id]" options={{ title: t('shell.sticker_title') }} />
      <Stack.Screen name="details/[id]" options={{ title: t('shell.spot_title') }} />
      <Stack.Screen name="garage/new" options={{ title: t('shell.garage_new_title') }} />
      <Stack.Screen name="garage/[carId]/index" options={{ title: t('shell.garage_car_title') }} />
      <Stack.Screen name="garage/[carId]/verify" options={{ title: t('shell.garage_verify_title') }} />
      <Stack.Screen name="sighting/[id]" options={{ title: t('shell.sighting_title') }} />
      <Stack.Screen name="trust" options={{ title: t('shell.trust_title') }} />
      <Stack.Screen name="share/[spotId]" options={{ title: t('shell.share_title') }} />
    </Stack>
  );
}
