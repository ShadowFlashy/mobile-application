/**
 * Web (PWA) preparation of the photo for Auto-fill (SPEC §9.1, D-15).
 *
 * The photo is drawn on a canvas with its long side at most 768 px and re-encoded as JPEG 0.85.
 * Re-encoding strips every byte of EXIF (GPS included), so the AI only ever receives pixels.
 * The same canvas also gives the 9×8 grayscale thumbnail for the duplicate-photo dHash.
 * Nothing here is stored: the Blob lives in memory until the identify call is done.
 *
 * Platform split: Metro picks this .web.ts file for the PWA and aiImage.ts on Android.
 */
import { AI_JPEG_QUALITY, AI_MAX_SIDE } from '../constants/ai';
import type { AiImage } from '../types/Identification';
import type { PickedPhoto } from '../types/Spot';
import { dataUriToBytes } from './dataUri';
import { DHASH_HEIGHT, DHASH_WIDTH, dHashFromGray, grayFromRgba } from './photoHash';

/**
 * Raw bytes of the picked photo, read on the device only, e.g. for EXIF. The web image picker gives
 * a data: URI, which is decoded locally (the CSP blocks fetch on data: and blob:); other URIs fall
 * back to fetch.
 */
export async function readPhotoBytes(uri: string): Promise<Uint8Array> {
  try {
    const decoded = dataUriToBytes(uri);
    if (decoded !== undefined) return decoded;
    const response = await fetch(uri);
    if (!response.ok) return new Uint8Array();
    return new Uint8Array(await response.arrayBuffer());
  } catch {
    return new Uint8Array();
  }
}

function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('photo_load'));
    image.src = uri;
  });
}

/** Size with the long side at most `maxSide` (never upscaled), at least 1 px per side. */
export function scaleToLongSide(width: number, height: number, maxSide: number): { width: number; height: number } {
  const scale = Math.min(1, maxSide / Math.max(width, height, 1));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function toJpeg(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', AI_JPEG_QUALITY);
  });
}

function dHashOf(source: HTMLCanvasElement): string | undefined {
  const thumb = document.createElement('canvas');
  thumb.width = DHASH_WIDTH;
  thumb.height = DHASH_HEIGHT;
  const context = thumb.getContext('2d');
  if (context === null) return undefined;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(source, 0, 0, DHASH_WIDTH, DHASH_HEIGHT);
  return dHashFromGray(grayFromRgba(context.getImageData(0, 0, DHASH_WIDTH, DHASH_HEIGHT).data));
}

/**
 * The EXIF-free, ≤768 px JPEG for Auto-fill plus its dHash. Undefined when the browser cannot
 * decode or encode the photo: the capture flow then simply continues in manual mode.
 */
export async function prepareAiImage(photo: PickedPhoto): Promise<AiImage | undefined> {
  try {
    const image = await loadImage(photo.uri);
    const size = scaleToLongSide(image.naturalWidth, image.naturalHeight, AI_MAX_SIDE);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    if (context === null) return undefined;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, size.width, size.height);

    const blob = await toJpeg(canvas);
    const dHash = dHashOf(canvas);
    if (blob === null || dHash === undefined) return undefined;
    return { blob, width: size.width, height: size.height, dHash };
  } catch {
    return undefined;
  }
}
