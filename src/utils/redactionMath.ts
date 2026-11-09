import type { PlateRegion } from '../types/Spot';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Regions smaller than this (relative to the photo) are treated as accidental taps. */
export const MIN_REGION_SIZE = 0.02;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Converts a drag gesture (start and end point in display pixels) into a normalised region.
 * Works for drags in any direction. Returns undefined for regions that are too small.
 */
export function regionFromDrag(start: Point, end: Point, display: Size): PlateRegion | undefined {
  if (display.width <= 0 || display.height <= 0) return undefined;
  const x1 = clamp01(Math.min(start.x, end.x) / display.width);
  const y1 = clamp01(Math.min(start.y, end.y) / display.height);
  const x2 = clamp01(Math.max(start.x, end.x) / display.width);
  const y2 = clamp01(Math.max(start.y, end.y) / display.height);
  const region = { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  if (region.width < MIN_REGION_SIZE || region.height < MIN_REGION_SIZE) return undefined;
  return region;
}

/** Converts a normalised region to whole pixels of an image, always inside the image bounds. */
export function toPixelRect(region: PlateRegion, image: Size): PixelRect {
  const x = Math.floor(clamp01(region.x) * image.width);
  const y = Math.floor(clamp01(region.y) * image.height);
  const right = Math.ceil(clamp01(region.x + region.width) * image.width);
  const bottom = Math.ceil(clamp01(region.y + region.height) * image.height);
  return { x, y, width: Math.max(1, right - x), height: Math.max(1, bottom - y) };
}

/**
 * Size of one pixelation block. Large blocks make sure a plate is unreadable:
 * at most ~6 blocks across the hidden area, and never smaller than 8 px.
 */
export function pixelBlockSize(rect: PixelRect): number {
  return Math.max(8, Math.ceil(Math.max(rect.width, rect.height) / 6));
}

/** Scales a photo down so its longest side is at most `maxSide`, keeping the aspect ratio. */
export function fitWithin(image: Size, maxSide: number): Size {
  const longest = Math.max(image.width, image.height);
  if (longest <= maxSide) return { width: image.width, height: image.height };
  const scale = maxSide / longest;
  return { width: Math.round(image.width * scale), height: Math.round(image.height * scale) };
}
