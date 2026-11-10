import { DUPLICATE_HAMMING_MAX } from '../constants/ai';
import type { Spot } from '../types/Spot';

/**
 * Duplicate-photo guard (SPEC P0-21): a 64-bit difference hash of the AI image. Two photos of the
 * same scene give hashes a few bits apart; re-encoding or downscaling barely changes them.
 */

export const DHASH_WIDTH = 9;
export const DHASH_HEIGHT = 8;
const HEX_DIGITS = '0123456789abcdef';

/**
 * Grayscale values (0..255) of RGBA pixel data, as `getImageData().data` returns it,
 * with the Rec. 601 luma weights.
 */
export function grayFromRgba(rgba: ArrayLike<number>): number[] {
  const gray: number[] = [];
  for (let index = 0; index + 3 < rgba.length; index += 4) {
    const red = rgba[index] ?? 0;
    const green = rgba[index + 1] ?? 0;
    const blue = rgba[index + 2] ?? 0;
    gray.push(0.299 * red + 0.587 * green + 0.114 * blue);
  }
  return gray;
}

/**
 * dHash of a 9×8 grayscale thumbnail (row-major, 72 values): per row, bit = left pixel brighter
 * than its right neighbour. 64 bits → 16 lowercase hex chars. Missing or non-finite values count as 0.
 */
export function dHashFromGray(gray: number[]): string {
  const value = (index: number): number => {
    const pixel = gray[index];
    return pixel !== undefined && Number.isFinite(pixel) ? pixel : 0;
  };
  let hash = '';
  let nibble = 0;
  let bits = 0;
  for (let row = 0; row < DHASH_HEIGHT; row += 1) {
    for (let column = 0; column < DHASH_WIDTH - 1; column += 1) {
      const left = value(row * DHASH_WIDTH + column);
      const right = value(row * DHASH_WIDTH + column + 1);
      nibble = (nibble << 1) | (left > right ? 1 : 0);
      bits += 1;
      if (bits === 4) {
        hash += HEX_DIGITS.charAt(nibble);
        nibble = 0;
        bits = 0;
      }
    }
  }
  return hash;
}

function hexValue(char: string): number {
  const value = HEX_DIGITS.indexOf(char.toLowerCase());
  return value < 0 ? 0 : value;
}

/** Number of differing bits between two hex hashes. Each extra char of the longer one counts as 4. */
export function hammingDistance(a: string, b: string): number {
  let distance = Math.abs(a.length - b.length) * 4;
  const length = Math.min(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    let bits = hexValue(a.charAt(index)) ^ hexValue(b.charAt(index));
    while (bits > 0) {
      distance += bits & 1;
      bits >>= 1;
    }
  }
  return distance;
}

/** The spot whose photo looks most like this one (Hamming distance ≤ max), if any. */
export function findDuplicate(spots: Spot[], hash: string, max: number = DUPLICATE_HAMMING_MAX): Spot | undefined {
  let best: Spot | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const spot of spots) {
    if (spot.photoHash === undefined) continue;
    const distance = hammingDistance(spot.photoHash, hash);
    if (distance <= max && distance < bestDistance) {
      best = spot;
      bestDistance = distance;
    }
  }
  return best;
}
