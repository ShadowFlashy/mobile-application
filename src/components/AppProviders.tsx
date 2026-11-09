// Side effect: initialises i18next before the first t() call (course ch. 20).
import '../i18n';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLanguageSetup } from '../hooks/useLanguage';
import { CACHE_BUSTER, PERSIST_MAX_AGE, queryClient, queryPersister } from '../lib/queryClient';
import { useAuthStore } from '../state/useAuthStore';
import { createThemedStyles, useTheme } from '../theme';
import { ConnectivityBanner } from './ConnectivityBanner';
import { ToastHost } from './ToastHost';

interface AppProvidersProps {
  children: ReactNode;
}

/** The query cache is restored from the device on start and saved after every change (offline use). */
const persistOptions = { persister: queryPersister, maxAge: PERSIST_MAX_AGE, buster: CACHE_BUSTER };

/**
 * Everything the app needs around its navigator, shared by the native and the web root layout
 * (course ch. 15: keep the root itself empty): safe areas, the TanStack Query cache, the status
 * bar for the active colour scheme, the offline banner and the global toast.
 * It also restores the session and applies the user's language once on start.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const { scheme } = useTheme();
  const styles = useStyles();
  const initialize = useAuthStore((state) => state.initialize);

  useLanguageSetup();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        {/* Dark status bar text on the light theme, light text on the dark theme. */}
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <SafeAreaView style={styles.root} edges={['top']}>
          <ConnectivityBanner />
          {children}
          <ToastHost />
        </SafeAreaView>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  root: { flex: 1, backgroundColor: colors.background },
}));
