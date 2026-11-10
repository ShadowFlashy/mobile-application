import { useMemo, useState } from 'react';
import { MINUTE } from '../constants/time';
import type { ProgressSnapshot } from '../types/Progress';
import { deriveProgress, deviceUtcOffset, isLastDayOfWeek, isoWeekKey } from '../utils/progression';
import { useCarModels, useCollections } from './useCarModels';
import { useNow } from './useNow';
import { useMySpots } from './useSpots';

export interface UseProgress {
  snapshot?: ProgressSnapshot;
  isLoading: boolean;
}

/**
 * The moment progress is derived for. It only moves when the week (or the Sunday "at risk" day)
 * changes, so the snapshot is memoized on spots, models and the week key, not on every tick.
 */
function useDerivationMoment(): Date {
  const now = useNow(MINUTE);
  const key = `${isoWeekKey(now, deviceUtcOffset)}|${isLastDayOfWeek(now, deviceUtcOffset) ? 'last' : 'open'}`;
  const [anchor, setAnchor] = useState({ key, moment: now });
  if (anchor.key !== key) setAnchor({ key, moment: now });
  return anchor.key === key ? anchor.moment : now;
}

/**
 * XP, level, challenges, streak and achievements, derived on the device from the user's own spots
 * (D-6: no progression tables). Collections (Appendix E) are optional: while they load, or if they
 * fail, progress still renders without set bonuses.
 */
export function useProgress(): UseProgress {
  const carModels = useCarModels();
  const spots = useMySpots();
  const collections = useCollections();
  const models = carModels.data;
  const mySpots = spots.data;
  const sets = collections.data;
  const moment = useDerivationMoment();

  const snapshot = useMemo(
    () =>
      models !== undefined && mySpots !== undefined
        ? deriveProgress(mySpots, models, moment, deviceUtcOffset, sets ?? [])
        : undefined,
    [models, mySpots, sets, moment],
  );

  return { snapshot, isLoading: carModels.isPending || spots.isPending };
}
