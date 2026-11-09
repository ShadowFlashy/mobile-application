import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { OfflineBanner } from './OfflineBanner';

/** Container: connects the network status hook to the presentational OfflineBanner. */
export function ConnectivityBanner() {
  const { isOnline } = useNetworkStatus();
  return <OfflineBanner visible={!isOnline} />;
}
