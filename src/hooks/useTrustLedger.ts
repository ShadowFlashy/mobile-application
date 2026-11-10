import { useMemo } from 'react';
import { buildTrustLedger, type TrustLedgerData } from '../utils/trustLedger';
import { useIdentifyQuota } from './useIdentifyQuota';
import { useMySpots } from './useSpots';

export interface UseTrustLedger extends TrustLedgerData {
  isLoading: boolean;
}

/**
 * The Privacy and auto-fill ledger "What Redline stores" (SPEC §10.4): blurred photos and cities counted
 * from the user's own spots, 0 plates and 0 GPS points, and the Auto-fill scans left today.
 */
export function useTrustLedger(): UseTrustLedger {
  const spots = useMySpots();
  const quota = useIdentifyQuota();
  const ledger = useMemo(() => buildTrustLedger(spots.data, quota.data), [spots.data, quota.data]);
  return { ...ledger, isLoading: spots.isPending };
}
