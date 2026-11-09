import { Slot } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppProviders } from '../src/components/AppProviders';

/**
 * Brand colour of the browser / OS chrome around the installed PWA. A literal on purpose: it must
 * match theme_color in public/manifest.json, and meta tags are not rendered UI.
 */
const THEME_COLOR = '#B91C1C';

/**
 * Root (web / PWA, course ch. 4 and 10.3): the same providers and navigator as _layout.tsx, plus the
 * web app manifest, the "add to home screen" meta tags and the service worker that keeps the
 * app shell available offline (public/sw.js). Browser APIs are only used in this .web.tsx file.
 */
export default function RootLayout() {
  useEffect(() => {
    // Only in production builds: in development the worker would cache bundles and break reloads.
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    void navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, []);

  return (
    <AppProviders>
      <PwaHead />
      <Slot />
    </AppProviders>
  );
}

/** PWA metadata in the HTML head (also written into the static export) and the page language. */
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
      <meta name="theme-color" content={THEME_COLOR} />
      <meta name="description" content={t('shell.meta_description')} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Redline" />
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    </Head>
  );
}

/** Friendly fallback when a screen crashes (a platform file cannot re-export from ./_layout). */
export { ScreenErrorBoundary as ErrorBoundary } from '../src/components/ScreenErrorBoundary';
