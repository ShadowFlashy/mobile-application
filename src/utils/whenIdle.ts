/** Longest wait for an idle moment before the callback runs anyway. */
export const IDLE_TIMEOUT_MS = 3000;

/**
 * Runs `callback` once the main thread is idle (requestIdleCallback, with a timeout), or on the next
 * macrotask where that API is missing. Returns a function that cancels it.
 *
 * Used to switch the language only after React has finished hydrating the pre-rendered web page:
 * React hydrates Suspense boundaries in later scheduler tasks, and the thread only becomes idle once
 * that work is done. Changing the global i18n language earlier makes those boundaries render text
 * that differs from the HTML (React errors #418 / #425 / #422).
 */
export function whenIdle(callback: () => void, timeout = IDLE_TIMEOUT_MS): () => void {
  if (typeof requestIdleCallback === 'function') {
    const handle = requestIdleCallback(() => callback(), { timeout });
    return () => cancelIdleCallback(handle);
  }
  const handle = setTimeout(callback, 0);
  return () => clearTimeout(handle);
}
