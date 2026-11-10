export const OWNER_VISIBILITIES = ['hidden', 'badge', 'vanity'] as const;
export type OwnerVisibility = (typeof OWNER_VISIBILITIES)[number];
export type OwnerVerification = 'pending' | 'verified';

export interface OwnerCar {
  id: string;
  make: string;
  model: string;
  nickname?: string;
  /** Last two characters of the plate. */
  plateHint: string;
  visibility: OwnerVisibility;
  shoutout?: string;
  /** Only when visibility = 'vanity'. */
  plateDisplay?: string;
  pingsPaused: boolean;
  verification: OwnerVerification;
  verifiedAt?: string;
  verifyExpiresAt?: string;
  carModelId?: string;
  createdAt: string;
}

export interface NewOwnerCar {
  make: string;
  model: string;
  nickname?: string;
  plate: string;
  visibility?: OwnerVisibility;
  shoutout?: string;
  carModelId?: string;
}

export interface OwnerCarChanges {
  nickname?: string;
  visibility?: OwnerVisibility;
  shoutout?: string;
  pingsPaused?: boolean;
  carModelId?: string;
  /** Required when switching to 'vanity' (re-enter the plate; must equal the registered one). */
  plate?: string;
}

/** A privacy-safe snapshot: what a verified owner learns when their car is spotted. */
export interface Sighting {
  id: string;
  ownerCarId: string;
  carLabel: string;
  city?: string;
  /** Start of the hour in which the car was spotted (ISO). */
  spottedHour: string;
  photoPath?: string;
  photoUrl?: string;
  /** Only when the spotter opted in. */
  spotterName?: string;
  createdAt: string;
  isRead: boolean;
}

export interface OwnerCarStats {
  ownerCarId: string;
  sightings: number;
  unread: number;
  lastCity?: string;
  lastSeen?: string;
}
export interface VerificationCode {
  code: string;
  expiresAt: string;
}
export const VERIFICATION_RESULTS = [
  'verified',
  'plate_mismatch',
  'code_mismatch',
  'code_unreadable',
  'plate_unreadable',
  'code_not_in_car',
  'expired',
  'too_many_attempts',
  'already_verified',
  'plate_taken',
  'not_found',
] as const;
export type VerificationResult = (typeof VERIFICATION_RESULTS)[number];
