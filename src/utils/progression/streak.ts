import type { StreakInfo } from '../../types/Progress';
import { shiftWeekKey } from './weeks';

/** How many weeks the lap chart shows (oldest first, this week last). */
export const STREAK_CHART_WEEKS = 8;

/** Length of the run of active weeks that ends at `weekKey` (0 when that week is inactive). */
export function runEndingAt(activeWeeks: ReadonlySet<string>, weekKey: string): number {
  let run = 0;
  let cursor = weekKey;
  while (activeWeeks.has(cursor)) {
    run += 1;
    cursor = shiftWeekKey(cursor, -1);
  }
  return run;
}

/** The longest run of consecutive active weeks. */
export function bestRun(activeWeeks: ReadonlySet<string>): number {
  let best = 0;
  for (const week of activeWeeks) {
    // Only count from the first week of a run.
    if (activeWeeks.has(shiftWeekKey(week, -1))) continue;
    let run = 0;
    let cursor = week;
    while (activeWeeks.has(cursor)) {
      run += 1;
      cursor = shiftWeekKey(cursor, 1);
    }
    best = Math.max(best, run);
  }
  return best;
}

/**
 * The weekly streak (SPEC P0-13). A week is active when at least one spot was logged in it.
 * - `current`: the run ending this week, or ending last week while this week is still open
 * - `atRisk`: it is Sunday (the last day), nothing was logged this week yet and there is a run to lose
 * - `best`: the longest run ever
 */
export function computeWeeklyStreak(
  activeWeekKeys: Iterable<string>,
  currentWeekKey: string,
  isLastDay: boolean,
): StreakInfo {
  const active = new Set(activeWeekKeys);
  const thisWeekActive = active.has(currentWeekKey);
  const current = thisWeekActive
    ? runEndingAt(active, currentWeekKey)
    : runEndingAt(active, shiftWeekKey(currentWeekKey, -1));
  const lastWeeks: boolean[] = [];
  for (let offset = STREAK_CHART_WEEKS - 1; offset >= 0; offset -= 1) {
    lastWeeks.push(active.has(shiftWeekKey(currentWeekKey, -offset)));
  }
  return {
    current,
    best: Math.max(bestRun(active), current),
    atRisk: isLastDay && !thisWeekActive && current > 0,
    lastWeeks,
  };
}
