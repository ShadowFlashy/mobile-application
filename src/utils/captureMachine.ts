import type {
  CaptureDraft,
  CaptureField,
  CaptureForm,
  CaptureSource,
  CaptureStatus,
  PlateConfirmation,
} from '../types/Capture';
import type { CarModel } from '../types/CarModel';
import type { AiImage, IdentifyOutcome } from '../types/Identification';
import type { Coordinates, PlaceSuggestion } from '../types/Location';
import type { PickedPhoto, PlateRegion } from '../types/Spot';
import {
  applyExif,
  applyIdentified,
  applyPlace,
  chooseCar,
  editField,
  emptyForm,
  initialProvenance,
  type CarChoice,
} from './captureForm';
import { SUGGESTION_COVERED } from './plateGate';
import { clampRegion, coverage } from './plateRegions';

/**
 * The capture flow as a pure reducer (SPEC §6.1, W4 task 1):
 * idle → preparing → identifying → reviewing → collecting → collected | failed.
 *
 * The review screen is shown from `preparing` on (D-15): identification runs in the background and
 * never blocks the user. After "Fill in myself" (`manual`) a late Co-Driver answer is ignored, and so
 * is any answer that arrives once the user is saving.
 */

export type CaptureEvent =
  | { type: 'exif_read'; exif: { takenAt?: string; gps?: Coordinates } }
  | { type: 'place_found'; place: PlaceSuggestion }
  | { type: 'ai_image_ready'; aiImage: AiImage }
  | { type: 'consent_required' }
  | { type: 'identify_started' }
  | { type: 'identify_finished'; outcome: IdentifyOutcome; models: readonly CarModel[] }
  | { type: 'fill_manually' }
  | { type: 'duplicate_found'; spotId: string }
  | { type: 'dismiss_duplicate' }
  | { type: 'add_region'; region: PlateRegion }
  | { type: 'update_region'; index: number; region: PlateRegion }
  | { type: 'remove_region'; index: number }
  | { type: 'accept_suggestion'; index: number }
  | { type: 'confirm_plates'; confirmation: PlateConfirmation }
  | { type: 'confirm_ignored_suggestions' }
  | { type: 'edit'; field: CaptureField; patch: Partial<CaptureForm> }
  /** Values without a provenance (notes, the ping and name-sharing switches). */
  | { type: 'set_options'; patch: Partial<Pick<CaptureForm, 'notes' | 'notifyOwner' | 'shareNameWithOwner'>> }
  | { type: 'choose_car'; choice: CarChoice }
  | { type: 'collect_started' }
  | { type: 'collect_failed'; message: string }
  | { type: 'collected' };

export interface NewDraftInput {
  id: string;
  photo: PickedPhoto;
  source: CaptureSource;
  /** ISO time used as the date until EXIF says otherwise. */
  now: string;
  shareNameDefault: boolean;
}

/** A fresh draft for a just-picked photo, already in `preparing`. */
export function createDraft({ id, photo, source, now, shareNameDefault }: NewDraftInput): CaptureDraft {
  return {
    id,
    photo,
    source,
    status: 'preparing',
    manual: false,
    regions: [],
    suggestions: [],
    acceptedSuggestions: [],
    plateConfirmation: undefined,
    ignoredSuggestionsConfirmed: false,
    form: emptyForm(now, shareNameDefault),
    provenance: initialProvenance(source),
    touched: [],
    aiFilled: [],
    awaitingConsent: false,
    duplicateDismissed: false,
  };
}

const ANALYSING: readonly CaptureStatus[] = ['preparing', 'identifying'];
const SAVING: readonly CaptureStatus[] = ['collecting', 'collected'];

/** True while Co-Driver may still deliver an answer that is worth applying. */
export function isAnalysing(draft: CaptureDraft): boolean {
  return !draft.manual && ANALYSING.includes(draft.status);
}

/** Any change to the regions clears the plate statement (D-5). */
function withRegions(draft: CaptureDraft, regions: PlateRegion[], acceptedSuggestions?: number[]): CaptureDraft {
  return {
    ...draft,
    regions,
    acceptedSuggestions: acceptedSuggestions ?? draft.acceptedSuggestions,
    plateConfirmation: undefined,
    ignoredSuggestionsConfirmed: false,
    saveError: undefined,
  };
}

function applyOutcome(draft: CaptureDraft, outcome: IdentifyOutcome, models: readonly CarModel[]): CaptureDraft {
  const base: CaptureDraft = { ...draft, outcome, awaitingConsent: false, status: 'reviewing' };
  switch (outcome.status) {
    case 'identified': {
      const filled = applyIdentified(base, outcome.car, models);
      // New suggestions may make an earlier "no plate" statement need its second tap again.
      return { ...filled, ignoredSuggestionsConfirmed: false };
    }
    case 'not_a_car':
      return base;
    case 'unavailable':
      return { ...base, manual: true };
  }
}

export function captureReducer(draft: CaptureDraft, event: CaptureEvent): CaptureDraft {
  const isSaving = SAVING.includes(draft.status);
  switch (event.type) {
    case 'exif_read':
      return applyExif({ ...draft, exif: event.exif }, event.exif);
    case 'place_found':
      return applyPlace({ ...draft, place: event.place }, event.place);
    case 'ai_image_ready':
      return { ...draft, aiImage: event.aiImage };
    case 'consent_required':
      return isAnalysing(draft) ? { ...draft, awaitingConsent: true } : draft;
    case 'identify_started':
      return isAnalysing(draft) ? { ...draft, status: 'identifying', awaitingConsent: false } : draft;
    case 'identify_finished':
      // Late answers (after "Fill in myself", or while saving) are ignored.
      return isAnalysing(draft) ? applyOutcome(draft, event.outcome, event.models) : draft;
    case 'fill_manually':
      return {
        ...draft,
        manual: true,
        awaitingConsent: false,
        status: ANALYSING.includes(draft.status) ? 'reviewing' : draft.status,
      };
    case 'duplicate_found':
      return { ...draft, duplicateOfId: event.spotId };
    case 'dismiss_duplicate':
      return { ...draft, duplicateDismissed: true };
    case 'add_region':
      return isSaving ? draft : withRegions(draft, [...draft.regions, clampRegion(event.region)]);
    case 'update_region': {
      if (isSaving || draft.regions[event.index] === undefined) return draft;
      const regions = draft.regions.map((region, index) =>
        index === event.index ? clampRegion(event.region) : region,
      );
      return withRegions(draft, regions);
    }
    case 'remove_region': {
      if (isSaving || draft.regions[event.index] === undefined) return draft;
      const regions = draft.regions.filter((_region, index) => index !== event.index);
      // A suggestion that is no longer covered shows up dashed again.
      const accepted = draft.acceptedSuggestions.filter((suggestionIndex) => {
        const suggestion = draft.suggestions[suggestionIndex];
        return suggestion !== undefined && coverage(suggestion, regions) >= SUGGESTION_COVERED;
      });
      return withRegions(draft, regions, accepted);
    }
    case 'accept_suggestion': {
      const suggestion = draft.suggestions[event.index];
      if (isSaving || suggestion === undefined || draft.acceptedSuggestions.includes(event.index)) return draft;
      return withRegions(draft, [...draft.regions, suggestion], [...draft.acceptedSuggestions, event.index]);
    }
    case 'confirm_plates':
      if (isSaving) return draft;
      if (event.confirmation === 'blurred' && draft.regions.length === 0) return draft;
      return {
        ...draft,
        plateConfirmation: event.confirmation,
        ignoredSuggestionsConfirmed: false,
        saveError: undefined,
      };
    case 'confirm_ignored_suggestions':
      return draft.plateConfirmation === 'none_visible' ? { ...draft, ignoredSuggestionsConfirmed: true } : draft;
    case 'edit':
      return isSaving ? draft : editField(draft, event.field, event.patch);
    case 'set_options':
      return isSaving ? draft : { ...draft, form: { ...draft.form, ...event.patch } };
    case 'choose_car':
      return isSaving ? draft : chooseCar(draft, event.choice);
    case 'collect_started':
      return draft.status === 'collecting' || draft.status === 'collected'
        ? draft
        : { ...draft, status: 'collecting', saveError: undefined };
    case 'collect_failed':
      return draft.status === 'collecting' ? { ...draft, status: 'failed', saveError: event.message } : draft;
    case 'collected':
      return { ...draft, status: 'collected' };
  }
}
