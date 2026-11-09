/** Spacing scale used for gaps and paddings in the base components. */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 6,
  md: 12,
  lg: 16,
  pill: 999,
};

/** Minimum touch target in dp (course ch. 19: at least 48 × 48 dp on Android). */
export const touchTarget = 48;

export type SpacingToken = keyof typeof spacing;
