/** A car photographed by the user: one entry in their sticker book. */
export interface Spot {
  id: string;
  userId: string;
  carModelId?: string;
  make: string;
  model: string;
  photoPath: string;
  /** Short-lived signed URL of the (already redacted) photo. */
  photoUrl?: string;
  locationLabel?: string;
  notes?: string;
  spottedAt: string;
  /** Set when the plate matched a car registered in the owner portal. */
  ownerCarId?: string;
  /** Only present when the owner opted in to show their (vanity) plate. */
  vanityPlate?: string;
}

/** Rectangle to hide, in normalised coordinates (0–1) relative to the photo. */
export interface PlateRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A picked photo before redaction. */
export interface PickedPhoto {
  uri: string;
  width: number;
  height: number;
}

/** A photo after the licence plates were pixelated on the device. */
export interface RedactedPhoto {
  uri: string;
  width: number;
  height: number;
  mimeType: 'image/jpeg';
}

/** Everything needed to save a new spot. */
export interface NewSpot {
  photo: RedactedPhoto;
  carModelId?: string;
  make: string;
  model: string;
  locationLabel?: string;
  notes?: string;
  /** Optional plate, only used to ping a registered owner. Never stored. */
  plate?: string;
}
