import type { BodyStyle } from '../types/CarModel';

/**
 * Decal-like side profiles of the 10 body styles (W5), drawn in a 120×48 viewBox, nose to the
 * right. Each path is the body with its wheel arches cut out and the greenhouse as an inner
 * sub-path (rendered with fillRule "evenodd", so the windows show through). The wheels are drawn
 * separately as circles at `wheels` (centre x) on `SILHOUETTE_WHEEL_Y`.
 */
export const SILHOUETTE_VIEWBOX = { width: 120, height: 48 } as const;
export const SILHOUETTE_WHEEL_Y = 38;
export const SILHOUETTE_WHEEL_RADIUS = 6;
/** Radius of the wheel-arch cut-out (a little larger than the wheel). */
const ARCH_RADIUS = 8;

export interface SilhouetteSpec {
  /** SVG path data: body outline plus window sub-paths. */
  path: string;
  /** Centre x of the rear and front wheel. */
  wheels: readonly [number, number];
}

interface ProfileInput {
  /** Outline from the rear bottom corner over the roof to the front bottom corner (starts with M). */
  top: string;
  rear: number;
  front: number;
  wheels: readonly [number, number];
  /** Greenhouse sub-paths, each closed. */
  windows?: readonly string[];
}

/** Closes a profile along the sill line with two wheel-arch cut-outs. */
export function buildSilhouettePath({ top, rear, front, wheels, windows = [] }: ProfileInput): string {
  const [rearWheel, frontWheel] = wheels;
  const y = SILHOUETTE_WHEEL_Y;
  const r = ARCH_RADIUS;
  const sill =
    `L${front},${y} L${frontWheel + r},${y} A${r},${r} 0 0 0 ${frontWheel - r},${y} ` +
    `L${rearWheel + r},${y} A${r},${r} 0 0 0 ${rearWheel - r},${y} L${rear},${y} Z`;
  return [`${top} ${sill}`, ...windows].join(' ');
}

function profile(input: ProfileInput): SilhouetteSpec {
  return { path: buildSilhouettePath(input), wheels: input.wheels };
}

export const SILHOUETTES: Record<BodyStyle, SilhouetteSpec> = {
  hatchback: profile({
    top: 'M10,36 L10,22 Q11,14 20,13 L64,12 Q70,12 75,16 L86,23 L104,25 Q111,26 112,30 L112,36',
    rear: 10,
    front: 112,
    wheels: [28, 94],
    windows: ['M22,15.5 L63,14.5 Q68,14.5 72,17.5 L80,22 L14,22 L14,19 Q15,16 22,15.5 Z'],
  }),
  sedan: profile({
    top: 'M4,36 L4,29 Q5,26 11,25 L30,23 L42,14 Q45,12 51,12 L73,12 Q79,12 83,16 L91,23 L108,25 Q115,26 116,30 L116,36',
    rear: 4,
    front: 116,
    wheels: [24, 96],
    windows: ['M44,16 Q46,14.5 51,14.5 L72,14.5 Q77,14.5 80,17.5 L85,22 L36,22 Z'],
  }),
  wagon: profile({
    top: 'M4,36 L4,20 Q5,14 12,13 L74,12 Q80,12 84,16 L92,23 L108,25 Q115,26 116,30 L116,36',
    rear: 4,
    front: 116,
    wheels: [24, 96],
    windows: ['M12,15.5 L73,14.5 Q78,14.5 81,17.5 L86,22 L8,22 L8,18 Q8,15.5 12,15.5 Z'],
  }),
  coupe: profile({
    top: 'M4,36 L4,30 Q6,26 14,25 L28,22 Q44,12 58,12 L68,12 Q78,13 86,20 L92,24 L109,26 Q115,27 116,31 L116,36',
    rear: 4,
    front: 116,
    wheels: [24, 96],
    windows: ['M34,22 Q46,14.5 58,14.5 L67,14.5 Q75,15 82,21 L83,22 Z'],
  }),
  convertible: profile({
    top: 'M4,36 L4,29 Q6,25 14,24 L58,23 L70,14 L74,14 L66,23 L108,25 Q115,26 116,30 L116,36',
    rear: 4,
    front: 116,
    wheels: [24, 96],
  }),
  suv: profile({
    top: 'M6,36 L6,14 Q7,8 14,8 L76,8 Q82,8 86,12 L94,20 L110,22 Q116,23 116,28 L116,36',
    rear: 6,
    front: 116,
    wheels: [26, 94],
    windows: ['M14,11 L75,11 Q80,11 83,14 L89,19 L10,19 L10,13 Q10,11 14,11 Z'],
  }),
  pickup: profile({
    top: 'M4,36 L4,22 L52,22 L52,12 Q53,10 58,10 L76,10 Q81,10 84,14 L92,22 L110,24 Q116,25 116,30 L116,36',
    rear: 4,
    front: 116,
    wheels: [24, 96],
    windows: ['M56,12.5 L75,12.5 Q79,12.5 82,15 L87,20 L56,20 Z'],
  }),
  van: profile({
    top: 'M6,36 L6,10 Q6,6 12,6 L88,6 Q94,6 98,12 L108,22 Q116,24 116,30 L116,36',
    rear: 6,
    front: 116,
    wheels: [26, 96],
    windows: ['M64,9 L88,9 Q92,9 95,13 L102,20 L64,20 Z'],
  }),
  supercar: profile({
    top: 'M4,36 L4,28 Q5,25 12,24 L34,22 Q50,15 62,15 L70,15 Q78,16 88,23 L110,27 Q116,29 116,32 L116,36',
    rear: 4,
    front: 116,
    wheels: [24, 96],
    windows: ['M44,20 Q54,17 62,17 L69,17 Q75,17.5 82,22 Z'],
  }),
  other: profile({
    top: 'M8,36 L8,26 Q10,20 22,19 L36,18 Q46,10 60,10 Q76,10 86,18 L104,21 Q114,23 114,30 L114,36',
    rear: 8,
    front: 114,
    wheels: [26, 94],
    windows: ['M42,18 Q50,12.5 60,12.5 Q72,12.5 80,18.5 Z'],
  }),
};
