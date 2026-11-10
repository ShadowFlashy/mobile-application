import { Slot } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppProviders } from '../src/components/AppProviders';
import { useServiceWorker } from '../src/hooks/useServiceWorker';
import { darkColors, lightColors } from '../src/theme';

/**
 * Root (web / PWA): the same providers and navigator as _layout.tsx, plus the web app manifest, the
 * "add to home screen" meta tags and the service worker (registered by useServiceWorker, W9).
 * Browser APIs are only used in this .web.tsx file.
 */
export default function RootLayout() {
  useServiceWorker();

  return (
    <AppProviders>
      <PwaHead />
      <Slot />
    </AppProviders>
  );
}

/**
 * PWA metadata in the HTML head (also written into the static export) and the page language. The
 * browser chrome follows the scheme: one theme-color per colour scheme, both taken from the tokens.
 */
function PwaHead() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Screen readers pronounce the page in the language the user sees (the static HTML starts in English).
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Head>
      <title>Redline</title>
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" media="(prefers-color-scheme: light)" content={lightColors.background} />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content={darkColors.background} />
      <meta name="color-scheme" content="light dark" />
      <meta name="description" content={t('shell.meta_description')} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Redline" />
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    </Head>
  );
}

/** Friendly fallback when a screen crashes (a platform file cannot re-export from ./_layout). */
export { ScreenErrorBoundary as ErrorBoundary } from '../src/components/ScreenErrorBoundary';
