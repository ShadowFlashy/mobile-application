/** Spacing scale (SPEC §7.4) for gaps and paddings. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  smd: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Corner radii. Concentric: sticker 14 outside, stickerInner 9 for the photo inside. */
export const radii = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  sticker: 14,
  stickerInner: 9,
  pill: 999,
} as const;

export const borders = {
  hairline: 1,
  strong: 2,
  stickerEdge: 3,
  focus: 2,
} as const;

/** Minimum touch target in dp (at least 48 × 48 dp on Android). */
export const touchTarget = 48;

/** Fixed photo aspect ratios, so the layout never shifts while photos load. */
export const aspect = {
  photo: 4 / 3,
  feed: 4 / 5,
  hero: 16 / 10,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radii;
