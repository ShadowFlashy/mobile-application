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

/** Smallest box side the editor allows while resizing (normalised). */
export const MIN_BOX_SIDE = 0.03;

/** Moves a box by a normalised offset, keeping it entirely inside the photo. */
export function moveRegion(region: PlateRegion, dx: number, dy: number): PlateRegion {
  const width = Math.min(1, Math.max(0, region.width));
  const height = Math.min(1, Math.max(0, region.height));
  return {
    x: Math.min(1 - width, Math.max(0, region.x + dx)),
    y: Math.min(1 - height, Math.max(0, region.y + dy)),
    width,
    height,
  };
}

/** Resizes a box from its bottom-right corner handle (normalised offset), within the photo. */
export function resizeRegion(region: PlateRegion, dx: number, dy: number): PlateRegion {
  const width = Math.min(1 - region.x, Math.max(MIN_BOX_SIDE, region.width + dx));
  const height = Math.min(1 - region.y, Math.max(MIN_BOX_SIDE, region.height + dy));
  return { x: region.x, y: region.y, width, height };
}

/**
 * The box the accessible "Add box" button places: plate-shaped and centred in the lower half, where
 * plates usually are. Each extra box is offset a little so boxes never stack exactly.
 */
export function defaultRegion(existingCount: number): PlateRegion {
  const offset = (existingCount % 4) * 0.05;
  return moveRegion({ x: 0.35 + offset, y: 0.6 + offset / 2, width: 0.3, height: 0.1 }, 0, 0);
}

/** Converts a pixel offset of a gesture into a normalised offset of the photo. */
export function toNormalisedDelta(dx: number, dy: number, display: Size): Point {
  if (display.width <= 0 || display.height <= 0) return { x: 0, y: 0 };
  return { x: dx / display.width, y: dy / display.height };
}

/** Variance of a list of values (0 for an empty list): how much detail a pixel area still holds. */
export function variance(values: ArrayLike<number>): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (let index = 0; index < values.length; index += 1) sum += values[index] ?? 0;
  const mean = sum / values.length;
  let squares = 0;
  for (let index = 0; index < values.length; index += 1) {
    const difference = (values[index] ?? 0) - mean;
    squares += difference * difference;
  }
  return squares / values.length;
}

/**
 * Pixelates RGBA pixel data in place: every block × block cell becomes the exact average colour of
 * its pixels. True averaging (instead of a canvas downscale, which only samples a few pixels) leaves
 * no fine detail such as plate characters behind.
 */
export function pixelateRgba(data: Uint8ClampedArray, width: number, height: number, block: number): void {
  const step = Math.max(1, Math.floor(block));
  for (let top = 0; top < height; top += step) {
    for (let left = 0; left < width; left += step) {
      const bottom = Math.min(height, top + step);
      const right = Math.min(width, left + step);
      const sums = [0, 0, 0, 0];
      let count = 0;
      for (let y = top; y < bottom; y += 1) {
        for (let x = left; x < right; x += 1) {
          const offset = (y * width + x) * 4;
          for (let channel = 0; channel < 4; channel += 1)
            sums[channel] = (sums[channel] ?? 0) + (data[offset + channel] ?? 0);
          count += 1;
        }
      }
      if (count === 0) continue;
      const average = sums.map((sum) => Math.round(sum / count));
      for (let y = top; y < bottom; y += 1) {
        for (let x = left; x < right; x += 1) {
          const offset = (y * width + x) * 4;
          for (let channel = 0; channel < 4; channel += 1) data[offset + channel] = average[channel] ?? 0;
        }
      }
    }
  }
}
