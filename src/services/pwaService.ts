import NetInfo from '@react-native-community/netinfo';

/**
 * PWA platform hooks — native version. The Android app has no service worker, so registration and
 * the photo cache are no-ops until December (SPEC §0.1 rule 11). Reconnects come from NetInfo.
 * The web version lives in pwaService.web.ts.
 */

/** Registers the service worker; `onUpdateReady` gets a function that activates a waiting update. */
export function registerServiceWorker(_onUpdateReady: (apply: () => void) => void): () => void {
  return () => undefined;
}

/** Drops the cached spot photos of the signed-in user (logout, account deletion). */
export function clearUserCaches(): void {
  // No photo cache outside the service worker.
}

/** Calls `listener` every time the device comes back online. Returns an unsubscribe function. */
export function onBackOnline(listener: () => void): () => void {
  let wasConnected = true;
  return NetInfo.addEventListener((state) => {
    const isConnected = state.isConnected !== false;
    if (isConnected && !wasConnected) listener();
    wasConnected = isConnected;
  });
}
