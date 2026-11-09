/**
 * Web (PWA) implementation of on-device plate redaction.
 *
 * The photo is drawn on a canvas, every marked region is pixelated with large blocks and the
 * result is re-encoded as JPEG. Re-encoding also strips EXIF metadata (including GPS position),
 * so neither the licence plates nor the exact location ever leave the device.
 *
 * Platform split: Metro picks this .web.ts file for the PWA and imageRedaction.ts on Android.
 */
import { ServiceError } from '../services/serviceError';
import type { PickedPhoto, PlateRegion, RedactedPhoto } from '../types/Spot';
import { fitWithin, pixelBlockSize, toPixelRect, type PixelRect } from './redactionMath';

/** Longest side of the uploaded photo, in pixels. Keeps uploads small (course ch. 21: images). */
const MAX_SIDE = 1600;
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
  const block = pixelBlockSize(rect);
  const smallWidth = Math.max(1, Math.ceil(rect.width / block));
  const smallHeight = Math.max(1, Math.ceil(rect.height / block));

  const buffer = document.createElement('canvas');
  buffer.width = smallWidth;
  buffer.height = smallHeight;
  const bufferContext = getContext(buffer);
  bufferContext.drawImage(context.canvas, rect.x, rect.y, rect.width, rect.height, 0, 0, smallWidth, smallHeight);

  context.imageSmoothingEnabled = false;
  context.drawImage(buffer, 0, 0, smallWidth, smallHeight, rect.x, rect.y, rect.width, rect.height);
  context.imageSmoothingEnabled = true;
}

export async function redactPhoto(photo: PickedPhoto, regions: PlateRegion[]): Promise<RedactedPhoto> {
  const image = await loadImage(photo.uri);
  const size = fitWithin({ width: image.naturalWidth, height: image.naturalHeight }, MAX_SIDE);

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
