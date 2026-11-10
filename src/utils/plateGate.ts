import type { CaptureDraft, PlateGate } from '../types/Capture';
import type { PlateRegion } from '../types/Spot';
import { hasCar } from './captureForm';
import { coverage } from './plateRegions';

/**
 * The plate privacy gate (SPEC D-5, P0-04). Add to album is enabled only after an explicit statement by
 * the user, made with the redacted preview on screen:
 * - "Every plate is blurred", which needs at least one region, or
 * - "No licence plate is visible", which needs a second tap when Auto-fill saw a plate that no
 *   region covers.
 * Auto-fill's boxes are only suggestions: they never count as regions until accepted, and nothing
 * is ever confirmed automatically. Every region change clears the statement (captureMachine).
 */

/** A suggestion counts as handled once the regions cover at least half of it. */
export const SUGGESTION_COVERED = 0.5;

/** Auto-fill's plate suggestions that no region covers (the "Auto-fill thinks it saw a plate" check). */
export function ignoredSuggestions(draft: Pick<CaptureDraft, 'suggestions' | 'regions'>): PlateRegion[] {
  return draft.suggestions.filter((suggestion) => coverage(suggestion, draft.regions) < SUGGESTION_COVERED);
}

/** True while the user's "no plate" statement still needs the second tap. */
export function needsSecondTap(draft: CaptureDraft): boolean {
  return (
    draft.plateConfirmation === 'none_visible' &&
    !draft.ignoredSuggestionsConfirmed &&
    ignoredSuggestions(draft).length > 0
  );
}

export interface GateInput {
  draft: CaptureDraft;
  isOnline: boolean;
}

/** Whether Add to album may run, and otherwise the first reason why not (plates before the car). */
export function canCollect({ draft, isOnline }: GateInput): PlateGate {
  if (draft.status === 'collecting' || draft.status === 'collected') return { ok: false, reason: 'busy' };
  if (!isOnline) return { ok: false, reason: 'offline' };
  if (draft.plateConfirmation === undefined) return { ok: false, reason: 'confirm_plates' };
  if (draft.plateConfirmation === 'blurred' && draft.regions.length === 0)
    return { ok: false, reason: 'confirm_plates' };
  if (needsSecondTap(draft)) return { ok: false, reason: 'confirm_ignored_suggestions' };
  if (draft.outcome?.status === 'not_a_car' && !draft.manual) return { ok: false, reason: 'missing_car' };
  if (!hasCar(draft.form)) return { ok: false, reason: 'missing_car' };
  return { ok: true };
}
