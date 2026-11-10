/**
 * PWA platform hooks — web version (SPEC §13.1): the service worker of the installed app, its update
 * flow and the per-user photo cache. Browser-only APIs live only in this .web.ts file.
 */
const SERVICE_WORKER_URL = '/sw.js';
const PHOTO_CACHE = 'redline-photos';

function hasServiceWorker(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Registers the service worker (production builds only: in development it would cache bundles and
 * break reloads). When a new version has installed and waits, `onUpdateReady` receives `apply`:
 * it tells the waiting worker to take over (SKIP_WAITING) and reloads once it controls the page.
 * There is no unconditional skipWaiting, so an update never swaps the app under the user's thumb.
 */
export function registerServiceWorker(onUpdateReady: (apply: () => void) => void): () => void {
  if (process.env.NODE_ENV !== 'production' || !hasServiceWorker()) return () => undefined;

  const container = navigator.serviceWorker;
  let cancelled = false;
  let accepted = false;
  let registration: ServiceWorkerRegistration | undefined;

  // The first install also claims the page; only an update the user accepted reloads it.
  const onControllerChange = () => {
    if (!accepted) return;
    accepted = false;
    window.location.reload();
  };
  const announce = (worker: ServiceWorker) => {
    if (cancelled) return;
    onUpdateReady(() => {
      accepted = true;
      worker.postMessage({ type: 'SKIP_WAITING' });
    });
  };
  const onVisible = () => {
    if (document.visibilityState === 'visible') void registration?.update().catch(() => undefined);
  };

  container.addEventListener('controllerchange', onControllerChange);
  document.addEventListener('visibilitychange', onVisible);
  void container
    .register(SERVICE_WORKER_URL)
    .then((registered) => {
      registration = registered;
      // An update that finished installing while the app was closed.
      if (registered.waiting !== null && container.controller !== null) announce(registered.waiting);
      registered.addEventListener('updatefound', () => {
        const installing = registered.installing;
        if (installing === null) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && container.controller !== null) announce(installing);
        });
      });
    })
    .catch(() => undefined);

  return () => {
    cancelled = true;
    container.removeEventListener('controllerchange', onControllerChange);
    document.removeEventListener('visibilitychange', onVisible);
  };
}

/**
 * Drops the cached spot photos (logout, account deletion), so the next person on this device never
 * sees them. Tells the worker (CLEAR_USER_CACHES) and also deletes the cache from the page, which
 * works even when no worker controls the page yet.
 */
export function clearUserCaches(): void {
  if (hasServiceWorker()) navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_USER_CACHES' });
  if (typeof caches !== 'undefined') void caches.delete(PHOTO_CACHE).catch(() => undefined);
}

/** Calls `listener` every time the browser comes back online. Returns an unsubscribe function. */
export function onBackOnline(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener('online', listener);
  return () => window.removeEventListener('online', listener);
}
