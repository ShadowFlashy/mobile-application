// Side effect: initialises i18next before the first t() call.
import '../i18n';

import { defaultShouldDehydrateQuery, type Query } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAppFonts } from '../hooks/useAppFonts';
import { useLanguageSetup } from '../hooks/useLanguage';
import { CACHE_BUSTER, PERSIST_MAX_AGE, queryClient, queryPersister } from '../lib/queryClient';
import { useAuthStore } from '../state/useAuthStore';
import { createThemedStyles, useTheme } from '../theme';
import { ConnectivityBanner } from './ConnectivityBanner';
import { ToastHost } from './ToastHost';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * The Auto-fill quota counter stays in memory only (SPEC P0-01). Filtered by key, not by `meta`:
 * useIdentifyCar's setQueryData can create that query without its meta.
 */
function shouldDehydrateQuery(query: Query): boolean {
  return defaultShouldDehydrateQuery(query) && query.queryKey[0] !== 'identify-quota';
}

/**
 * Mutations are never written to the device: a paused createSpot holds the typed plate in its
 * variables, and no mutation needs to survive a reload (SPEC §0.1-13).
 */
function shouldDehydrateMutation(): boolean {
  return false;
}

/** The query cache is restored from the device on start and saved after every change (offline use). */
const persistOptions = {
  persister: queryPersister,
  maxAge: PERSIST_MAX_AGE,
  buster: CACHE_BUSTER,
  dehydrateOptions: { shouldDehydrateQuery, shouldDehydrateMutation },
};

/**
 * Everything the app needs around its navigator, shared by the native and the web root layout:
 * the direction A fonts (loaded without blocking render), safe areas, the TanStack Query cache, the
 * status bar for the active colour scheme, the offline banner and the global toast. It also restores
 * the session and applies the user's language once on start.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const { scheme } = useTheme();
  const styles = useStyles();
  const initialize = useAuthStore((state) => state.initialize);

  // Never gates rendering: text uses the fallback fonts until the faces are ready.
  useAppFonts();
  useLanguageSetup();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        {/* Dark status bar text on the light scheme, light text on the dark scheme. */}
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
  root: { flex: 1, backgroundColor: colors.bg },
}));
