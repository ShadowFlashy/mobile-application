import { useEffect, useState } from 'react';

/**
 * Web / PWA version of useNetworkStatus (the Android app uses NetInfo, see useNetworkStatus.ts).
 *
 * In the browser NetInfo only follows `navigator.connection`, which does not report every
 * disconnect. The browser's own online/offline events are the reliable signal for a PWA.
 * Starts as online so the pre-rendered page and the first render match.
 */
export function useNetworkStatus(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return { isOnline };
}
