/**
 * Pure layout maths for the brand icons (SPEC P0-23), shared by scripts/generate-icons.mjs and its
 * unit test (cypress/unit/trust/iconLayout.cy.ts). Every size is in units of the 1024 master canvas.
 */

/** The BrandMark sticker on its 64 grid: a 60 × 60 square with corner radius 14, centred at (32, 32). */
export const STICKER = { grid: 64, half: 30, cornerRadius: 14 };

/** Extra room for the drop shadow below the sticker, in grid units (dy 1.4 + 2 × stdDeviation 1.6). */
export const SHADOW_GRID = 4.6;

/** Canvas size of the master SVG. */
export const CANVAS = 1024;

/**
 * Distance from the sticker centre to its farthest point (a rounded corner), in grid units. Rotation
 * does not change it, so the tilt never pushes the sticker out of a circular safe zone.
 */
export function stickerReach() {
  const { half, cornerRadius } = STICKER;
  return (half - cornerRadius) * Math.SQRT2 + cornerRadius;
}

/**
 * Farthest painted point from the canvas centre, in canvas units, for a sticker drawn at `scale`
 * around (cx, cy). Includes the shadow.
 */
export function paintedReach(placement) {
  const offset = Math.hypot(placement.cx - CANVAS / 2, placement.cy - CANVAS / 2);
  return offset + (stickerReach() + SHADOW_GRID) * placement.scale;
}

/**
 * True when the sticker stays inside a centred circle of `ratio` × canvas (for example 0.4 for a
 * maskable PWA icon, 33 / 108 for an Android adaptive-icon foreground).
 */
export function fitsSafeZone(placement, ratio) {
  return paintedReach(placement) <= ratio * CANVAS;
}

/** True when the sticker, tilted by `placement.tilt` degrees, stays inside the canvas. */
export function fitsCanvas(placement) {
  const radians = (Math.abs(placement.tilt) * Math.PI) / 180;
  const halfBox = (STICKER.half * (Math.cos(radians) + Math.sin(radians)) + SHADOW_GRID) * placement.scale;
  return (
    placement.cx - halfBox >= 0 &&
    placement.cy - halfBox >= 0 &&
    placement.cx + halfBox <= CANVAS &&
    placement.cy + halfBox <= CANVAS
  );
}

/** The SVG transform that places the 64-grid sticker on the 1024 canvas. */
export function stickerTransform(placement) {
  const half = STICKER.grid / 2;
  return `translate(${placement.cx} ${placement.cy}) rotate(${placement.tilt}) scale(${placement.scale}) translate(-${half} -${half})`;
}
