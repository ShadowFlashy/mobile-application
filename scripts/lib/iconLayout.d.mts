// Types of iconLayout.mjs for the TypeScript unit tests.
export interface StickerPlacement {
  cx: number;
  cy: number;
  scale: number;
  tilt: number;
}
export declare const STICKER: { grid: number; half: number; cornerRadius: number };
export declare const SHADOW_GRID: number;
export declare const CANVAS: number;
export declare function stickerReach(): number;
export declare function paintedReach(placement: StickerPlacement): number;
export declare function fitsSafeZone(placement: StickerPlacement, ratio: number): boolean;
export declare function fitsCanvas(placement: StickerPlacement): boolean;
export declare function stickerTransform(placement: StickerPlacement): string;
