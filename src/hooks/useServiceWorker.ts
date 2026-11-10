/**
 * Registers the service worker and shows the "Update available" toast — web only, see
 * useServiceWorker.web.ts. The native app has no service worker: a no-op until December.
 */
export function useServiceWorker(): void {
  // No service worker in the native app.
}
