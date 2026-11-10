import type { BodyStyle, PaintColor } from './CarModel';
export const IDENTIFIED_BY = ['manual', 'ai', 'ai_edited'] as const;
export type IdentifiedBy = (typeof IDENTIFIED_BY)[number];

export interface Spot {
  id: string;
  userId: string;
  carModelId?: string;
  make: string;
  model: string;
  photoPath: string;
  /** Short-lived signed URL of the redacted photo (never a data: URL). */
  photoUrl?: string;
  /** City label (gazetteer or typed). The only place data a verified owner ever sees. */
  city?: string;
  /** v1 free-text place, private to the spotter. */
  locationLabel?: string;
  notes?: string;
  spottedAt: string;
  createdAt: string;
  paint: PaintColor;
  bodyStyle: BodyStyle;
  platesHidden: number;
  identifiedBy: IdentifiedBy;
  aiConfidence?: number;
  aiModelId?: string;
  generation?: string;
  yearFrom?: number;
  yearTo?: number;
  photoHash?: string;
  shareNameWithOwner: boolean;
}

/** Rectangle in normalised coordinates (0–1) relative to the photo. */
export interface PlateRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface PickedPhoto {
  uri: string;
  width: number;
  height: number;
}
export interface RedactedPhoto {
  uri: string;
  width: number;
  height: number;
  mimeType: 'image/jpeg';
}

export interface NewSpot {
  photo: RedactedPhoto;
  carModelId?: string;
  make: string;
  model: string;
  city?: string;
  locationLabel?: string;
  notes?: string;
  spottedAt?: string;
  /** Main car's plate, only to ping a VERIFIED owner. Sent once as plate_input, never stored. */
  plate?: string;
  paint: PaintColor;
  bodyStyle: BodyStyle;
  platesHidden: number;
  identifiedBy: IdentifiedBy;
  aiConfidence?: number;
  aiModelId?: string;
  generation?: string;
  yearFrom?: number;
  yearTo?: number;
  photoHash?: string;
  shareNameWithOwner: boolean;
}

/** P1 "Fix it". undefined = unchanged; clearCarModel = file it as a wildcard. */
export interface SpotChanges {
  carModelId?: string;
  clearCarModel?: boolean;
  make?: string;
  model?: string;
  city?: string;
  notes?: string;
  paint?: PaintColor;
  bodyStyle?: BodyStyle;
  generation?: string;
  yearFrom?: number;
  yearTo?: number;
  identifiedBy?: IdentifiedBy;
}

export interface SpotShowcase {
  visibility: 'badge' | 'vanity';
  shoutout?: string;
  vanityPlate?: string;
}
