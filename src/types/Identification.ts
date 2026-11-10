import type { BodyStyle, PaintColor } from './CarModel';
import type { VerificationResult } from './OwnerCar';
import type { PlateRegion } from './Spot';
export type NormalizedBox = PlateRegion;
export interface CarGuess {
  make: string;
  model: string;
  confidence: number;
  catalogueId?: string;
}
export interface IdentifiedCar {
  make: string;
  model: string;
  generation?: string;
  yearFrom?: number;
  yearTo?: number;
  bodyStyle: BodyStyle;
  paint: PaintColor;
  confidence: number;
  catalogueId?: string;
  alternatives: CarGuess[];
  vehicleBox?: NormalizedBox;
  /** Every plate of every vehicle, normalised, unpadded (the app pads). */
  plates: NormalizedBox[];
  /** Main car only, A-Z0-9. Memory only, never persisted. */
  plateText?: string;
  /** English, AI-generated; shown only in en, labelled as AI. */
  funFact?: string;
}
export const UNAVAILABLE_REASONS = [
  'offline',
  'disabled',
  'timeout',
  'quota',
  'busy',
  'not_configured',
  'error',
  'unsupported',
] as const;
export type UnavailableReason = (typeof UNAVAILABLE_REASONS)[number];
export type IdentifyOutcome =
  | { status: 'identified'; car: IdentifiedCar; remainingToday: number; provider?: string }
  | { status: 'not_a_car'; subject?: string; remainingToday: number }
  | { status: 'unavailable'; reason: UnavailableReason };
export type VerifyOutcome =
  | { status: 'result'; result: VerificationResult; remainingToday: number }
  | { status: 'unavailable'; reason: UnavailableReason };
export type ConfidenceTier = 'sure' | 'likely' | 'guess';
export type Provenance = 'ai' | 'auto' | 'user';
/** The EXIF-free, downscaled JPEG sent to identify-car (never stored). */
export interface AiImage {
  blob: Blob;
  width: number;
  height: number;
  /** 16 hex chars */ dHash: string;
}
export interface IdentifyQuota {
  remaining: number;
  dailyLimit: number;
}
