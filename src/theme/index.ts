// Direction A "Timing screen" design system (see A-FOUNDATION.md). fonts.ts is deliberately NOT
// exported here: its require('./x.ttf') breaks Vite in Storybook and Cypress; only
// src/hooks/useAppFonts.ts imports it.
export { AA_NON_TEXT, AA_TEXT, CONTRAST_PAIRS, darkColors, lightColors } from './colors';
export type { ContrastPair, TextColorToken, ThemeColors } from './colors';
export { contrastRatio, relativeLuminance } from './contrast';
export { durations, easings, haptics, resolveDuration, springs, useMotion, useReducedMotion } from './motion';
export type { DurationToken, Motion } from './motion';
export { paint } from './paint';
export { plate } from './plate';
export type { PlateColors } from './plate';
export { RARITY_ORDER, ROUNDEL_OUTER, ROUNDEL_SIZE, roundels } from './rarity';
export type { RoundelStyle } from './rarity';
export { aspect, borders, columns, iconSizes, lines, radii, rowHeights, spacing, touchTarget } from './spacing';
export type { RadiusToken, SpacingToken } from './spacing';
export {
  A_TEXT_VARIANTS,
  FONT_FAMILIES,
  fontFamily,
  fontSizes,
  LEGACY_TEXT_VARIANTS,
  LEGACY_VARIANT_MAP,
  lineHeights,
  MAX_FONT_SCALE,
  resolveVariant,
  TEXT_TONES,
  TEXT_VARIANTS,
  textVariants,
  variantFamily,
} from './typography';
export type { ATextVariant, FontFamilyName, LegacyTextVariant, TextTone, TextVariant } from './typography';
export {
  buildNavigatorTheme,
  createThemedStyles,
  darkTheme,
  lightTheme,
  ThemeProvider,
  useNavigatorTheme,
  useTheme,
} from './useTheme';
export type { ColorScheme, NavigatorTheme, Theme } from './useTheme';
