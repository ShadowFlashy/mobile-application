/**
 * Web (PWA) implementation of on-device plate redaction.
 *
 * The photo is drawn on a canvas, every marked region is pixelated with large averaged blocks and the
 * result is re-encoded as JPEG. Re-encoding also strips EXIF metadata (including GPS position),
 * so neither the licence plates nor the exact location ever leave the device.
 *
 * Platform split: Metro picks this .web.ts file for the PWA and imageRedaction.ts on Android.
 */
import { UPLOAD_MAX_SIDE } from '../constants/ai';
import { ServiceError } from '../services/serviceError';
import type { PickedPhoto, PlateRegion, RedactedPhoto } from '../types/Spot';
import { fitWithin, pixelateRgba, pixelBlockSize, toPixelRect, type PixelRect } from './redactionMath';

const JPEG_QUALITY = 0.85;

function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new ServiceError('photo_load'));
    image.src = uri;
  });
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (context === null) {
    throw new ServiceError('photo_edit_unsupported');
  }
  return context;
}

function pixelate(context: CanvasRenderingContext2D, rect: PixelRect): void {
  const pixels = context.getImageData(rect.x, rect.y, rect.width, rect.height);
  pixelateRgba(pixels.data, rect.width, rect.height, pixelBlockSize(rect));
  context.putImageData(pixels, rect.x, rect.y);
}

/**
 * Pixelates every region and re-encodes the photo as JPEG (EXIF stripped). The same function makes
 * the upload (≤1600 px) and the live preview in the plate editor (≤960 px, SPEC P0-04), so the
 * preview shows exactly the pixels that will be uploaded.
 */
export async function redactPhoto(
  photo: PickedPhoto,
  regions: PlateRegion[],
  maxSide: number = UPLOAD_MAX_SIDE,
): Promise<RedactedPhoto> {
  const image = await loadImage(photo.uri);
  const size = fitWithin({ width: image.naturalWidth, height: image.naturalHeight }, maxSide);

  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const context = getContext(canvas);
  context.drawImage(image, 0, 0, size.width, size.height);

  for (const region of regions) {
    pixelate(context, toPixelRect(region, size));
  }

  return {
    uri: canvas.toDataURL('image/jpeg', JPEG_QUALITY),
    width: size.width,
    height: size.height,
    mimeType: 'image/jpeg',
  };
}
