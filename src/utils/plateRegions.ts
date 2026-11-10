import { PLATE_PAD_X, PLATE_PAD_Y } from '../constants/ai';
import type { PlateRegion } from '../types/Spot';

/**
 * Plate boxes from Co-Driver → blur regions (SPEC §4 P0-04, §9.4). The model's boxes are imprecise,
 * so they are padded generously (+40 % width, +80 % height, centred), merged when they overlap and
 * clamped to the photo. The results are only *suggestions*: W4 shows them dashed until the user
 * accepts them. All coordinates are normalised (0..1, top-left origin).
 */

/** Smallest side a region may have after clamping (a 0-size box blurs nothing). */
const MIN_SIDE = 0.001;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Keeps the box inside the photo; negative or non-finite sizes become 0. */
export function clampRegion(box: PlateRegion): PlateRegion {
  const left = clamp01(box.x);
  const top = clamp01(box.y);
  const right = clamp01(box.x + Math.max(0, Number.isFinite(box.width) ? box.width : 0));
  const bottom = clamp01(box.y + Math.max(0, Number.isFinite(box.height) ? box.height : 0));
  return { x: left, y: top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

/** Grows the box by PLATE_PAD_X of its width and PLATE_PAD_Y of its height, around its centre, then clamps. */
export function padRegion(box: PlateRegion): PlateRegion {
  const width = box.width * (1 + PLATE_PAD_X);
  const height = box.height * (1 + PLATE_PAD_Y);
  const centreX = box.x + box.width / 2;
  const centreY = box.y + box.height / 2;
  return clampRegion({ x: centreX - width / 2, y: centreY - height / 2, width, height });
}

function overlaps(a: PlateRegion, b: PlateRegion): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

function union(a: PlateRegion, b: PlateRegion): PlateRegion {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
}

/**
 * Replaces every group of overlapping boxes by their bounding box, until no two boxes overlap
 * (a merged box can newly overlap a third one). Boxes that only touch stay separate.
 */
export function mergeRegions(boxes: PlateRegion[]): PlateRegion[] {
  const merged = boxes.map((box) => ({ ...box }));
  let changed = true;
  while (changed) {
    changed = false;
    for (let first = 0; first < merged.length && !changed; first += 1) {
      for (let second = first + 1; second < merged.length; second += 1) {
        const a = merged[first];
        const b = merged[second];
        if (a !== undefined && b !== undefined && overlaps(a, b)) {
          merged.splice(second, 1);
          merged.splice(first, 1, union(a, b));
          changed = true;
          break;
        }
      }
    }
  }
  return merged;
}

/** Co-Driver's plate boxes → padded, clamped, merged suggestions. Degenerate boxes are dropped. */
export function regionsFromDetections(plates: PlateRegion[]): PlateRegion[] {
  const padded = plates
    .map(clampRegion)
    .filter((box) => box.width >= MIN_SIDE && box.height >= MIN_SIDE)
    .map(padRegion);
  return mergeRegions(padded);
}

/**
 * Share (0..1) of the detected plate's area that the regions cover together (overlaps counted
 * once). Exact: the detected box is cut into cells along every region edge. A zero-area detection
 * has nothing left to cover, so it counts as fully covered.
 */
export function coverage(detected: PlateRegion, regions: PlateRegion[]): number {
  const target = clampRegion(detected);
  const area = target.width * target.height;
  if (area <= 0) return 1;
  const clipped = regions.map(clampRegion).filter((region) => region.width > 0 && region.height > 0);
  if (clipped.length === 0) return 0;

  const right = target.x + target.width;
  const bottom = target.y + target.height;
  const inside = (value: number, from: number, to: number) => value > from && value < to;
  const xs = [
    target.x,
    right,
    ...clipped.flatMap((r) => [r.x, r.x + r.width]).filter((v) => inside(v, target.x, right)),
  ];
  const ys = [
    target.y,
    bottom,
    ...clipped.flatMap((r) => [r.y, r.y + r.height]).filter((v) => inside(v, target.y, bottom)),
  ];
  const sortedX = [...new Set(xs)].sort((a, b) => a - b);
  const sortedY = [...new Set(ys)].sort((a, b) => a - b);

  let covered = 0;
  for (let i = 0; i + 1 < sortedX.length; i += 1) {
    for (let j = 0; j + 1 < sortedY.length; j += 1) {
      const x0 = sortedX[i] ?? 0;
      const x1 = sortedX[i + 1] ?? 0;
      const y0 = sortedY[j] ?? 0;
      const y1 = sortedY[j + 1] ?? 0;
      const midX = (x0 + x1) / 2;
      const midY = (y0 + y1) / 2;
      const isCovered = clipped.some(
        (r) => midX >= r.x && midX <= r.x + r.width && midY >= r.y && midY <= r.y + r.height,
      );
      if (isCovered) covered += (x1 - x0) * (y1 - y0);
    }
  }
  return Math.min(1, Math.max(0, covered / area));
}
