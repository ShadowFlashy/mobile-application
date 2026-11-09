import { Slot } from 'expo-router';
import { AppProviders } from '../src/components/AppProviders';

/**
 * Root (Android / iOS): only the providers and the navigator (course ch. 15: keep App.tsx empty).
 * The web build uses _layout.web.tsx, which adds the PWA head tags and the service worker.
 */
export default function RootLayout() {
  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}

/** Friendly fallback when a screen crashes, instead of a white screen. */
export { ScreenErrorBoundary as ErrorBoundary } from '../src/components/ScreenErrorBoundary';
