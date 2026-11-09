import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

// Only use the device's own connectivity signal. NetInfo's default reachability check pings a
// Google URL in the background; that is not needed here and would leak usage data (course ch. 23).
NetInfo.configure({ reachabilityShouldRun: () => false });

/**
 * Mobile-specific reactivity (course ch. 8): reacts when Wi-Fi / 4G drops so the UI can show
 * an offline banner. Android version (NetInfo); the PWA uses useNetworkStatus.web.ts.
 */
export function useNetworkStatus(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected !== false);
    });
    return unsubscribe;
  }, []);

  return { isOnline };
}
