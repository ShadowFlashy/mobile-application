import type { BodyStyle, PaintColor } from './CarModel';
import type { AiImage, IdentifyOutcome, Provenance } from './Identification';
import type { Coordinates, PlaceSuggestion } from './Location';
import type { PickedPhoto, PlateRegion } from './Spot';

export type CaptureSource = 'camera' | 'library';
export type CaptureStatus = 'idle' | 'preparing' | 'identifying' | 'reviewing' | 'collecting' | 'collected' | 'failed';

export interface CaptureForm {
  carModelId?: string;
  make: string;
  model: string;
  generation: string;
  yearFrom?: number;
  yearTo?: number;
  paint: PaintColor;
  bodyStyle: BodyStyle;
  city: string;
  spottedAt: string;
  notes: string;
  /** Memory only. */ plate: string;
  notifyOwner: boolean;
  shareNameWithOwner: boolean;
}

export type CaptureField = 'car' | 'paint' | 'city' | 'date' | 'plate';
export type FieldProvenance = Record<CaptureField, Provenance>;

/** The user's explicit statement about the licence plates (D-5). */
export type PlateConfirmation = 'blurred' | 'none_visible';

export interface CaptureDraft {
  /** Unique per photo: background results for an older draft are ignored. W4 addition. */
  id: string;
  photo: PickedPhoto;
  source: CaptureSource;
  status: CaptureStatus;
  /** "Fill in myself" (or Auto-fill unavailable): later AI results are ignored. */
  manual: boolean;
  aiImage?: AiImage;
  exif?: { takenAt?: string; gps?: Coordinates };
  place?: PlaceSuggestion;
  outcome?: IdentifyOutcome;
  regions: PlateRegion[];
  /** padded AI boxes, shown dashed until accepted */ suggestions: PlateRegion[];
  acceptedSuggestions: number[];
  /** explicit user statement; reset on every region change */ plateConfirmation?: PlateConfirmation;
  /** Second tap: "No licence plate is visible" although Auto-fill suggested plates. W4 addition. */
  ignoredSuggestionsConfirmed: boolean;
  form: CaptureForm;
  provenance: FieldProvenance;
  /** Fields the user edited themselves; never overwritten by a late AI answer. W4 addition. */
  touched: CaptureField[];
  /** Fields Auto-fill filled in (to tell `ai` from `ai_edited`). W4 addition. */
  aiFilled: CaptureField[];
  /** Waiting for the first-use AI consent (AiConsentSheet). W4 addition. */
  awaitingConsent: boolean;
  /** A cached spot whose photo looks the same (dHash distance ≤ 6). W4 addition. */
  duplicateOfId?: string;
  duplicateDismissed: boolean;
  /** Message of the last failed save, shown above Add to album. W4 addition. */
  saveError?: string;
}

export type GateReason = 'confirm_plates' | 'confirm_ignored_suggestions' | 'missing_car' | 'busy' | 'offline';

/** Result of `canCollect` (plateGate.ts). */
export type PlateGate = { ok: true } | { ok: false; reason: GateReason };
