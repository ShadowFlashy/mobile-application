/**
 * Native (Android) implementation placeholder for plate redaction (the PWA uses imageRedaction.web.ts).
 *
 * The PWA uses a canvas (see imageRedaction.web.ts). The native app (assignment 2) will pixelate
 * regions with @shopify/react-native-skia. Until then we refuse to continue instead of ever
 * uploading a photo with a readable licence plate (privacy by design).
 */
import { ServiceError } from '../services/serviceError';
import type { PickedPhoto, PlateRegion, RedactedPhoto } from '../types/Spot';

export async function redactPhoto(
  _photo: PickedPhoto,
  _regions: PlateRegion[],
  _maxSide?: number,
): Promise<RedactedPhoto> {
  throw new ServiceError('native_redaction_unavailable');
}
