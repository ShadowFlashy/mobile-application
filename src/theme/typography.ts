import { Platform, type TextStyle } from 'react-native';

/**
 * LIVERY typography (SPEC §7.3): Barlow Condensed for racing-livery headlines and numbers, Barlow
 * for very legible UI text. Variants set `fontFamily` only, never `fontWeight` (Android ignores the
 * weight of custom families). The font files themselves are loaded by `useAppFonts` (fonts.ts).
 */
export const FONT_FAMILIES = {
  condensedBold: 'BarlowCondensed_700Bold',
  condensedExtraBoldItalic: 'BarlowCondensed_800ExtraBold_Italic',
  regular: 'Barlow_400Regular',
  medium: 'Barlow_500Medium',
  bold: 'Barlow_700Bold',
} as const;

export type FontFamilyName = (typeof FONT_FAMILIES)[keyof typeof FONT_FAMILIES];

/** CSS fallback stacks for the web, so text stays readable while the TTFs load. */
const WEB_FALLBACK: Record<FontFamilyName, string> = {
  BarlowCondensed_700Bold: '"Arial Narrow", system-ui, sans-serif',
  BarlowCondensed_800ExtraBold_Italic: '"Arial Narrow", system-ui, sans-serif',
  Barlow_400Regular: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  Barlow_500Medium: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  Barlow_700Bold: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

/** The family to put in a style: the bare registered name on native, a fallback stack on the web. */
export function fontFamily(name: FontFamilyName): string {
  return Platform.select({ web: `${name}, ${WEB_FALLBACK[name]}`, default: name });
}

export const TEXT_VARIANTS = [
  'hero',
  'display',
  'title',
  'headline',
  'body',
  'bodyStrong',
  'bodySm',
  'label',
  'caption',
  'number',
  'numberSm',
  'stickerNo',
] as const;
export type TextVariant = (typeof TEXT_VARIANTS)[number];

/** Text tones: the colour role of a text, resolved to a colour token by the Text primitive. */
export const TEXT_TONES = [
  'default',
  'muted',
  'subtle',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
  'onPrimary',
  'inverse',
  'onStage',
  'onStageMuted',
  'onSignal',
] as const;
export type TextTone = (typeof TEXT_TONES)[number];

interface VariantSpec {
  family: FontFamilyName;
  size: number;
  line: number;
  tracking: number;
  upper?: boolean;
  tabular?: boolean;
}

const VARIANT_SPECS: Record<TextVariant, VariantSpec> = {
  hero: { family: FONT_FAMILIES.condensedExtraBoldItalic, size: 44, line: 44, tracking: -0.5, upper: true },
  display: { family: FONT_FAMILIES.condensedExtraBoldItalic, size: 34, line: 36, tracking: -0.25, upper: true },
  title: { family: FONT_FAMILIES.condensedExtraBoldItalic, size: 24, line: 28, tracking: 0, upper: true },
  headline: { family: FONT_FAMILIES.bold, size: 18, line: 24, tracking: 0 },
  body: { family: FONT_FAMILIES.regular, size: 16, line: 24, tracking: 0 },
  bodyStrong: { family: FONT_FAMILIES.bold, size: 16, line: 24, tracking: 0 },
  bodySm: { family: FONT_FAMILIES.regular, size: 14, line: 20, tracking: 0 },
  label: { family: FONT_FAMILIES.bold, size: 13, line: 16, tracking: 0.8, upper: true },
  caption: { family: FONT_FAMILIES.medium, size: 12, line: 16, tracking: 0 },
  number: { family: FONT_FAMILIES.condensedBold, size: 28, line: 30, tracking: 0, tabular: true },
  numberSm: { family: FONT_FAMILIES.condensedBold, size: 17, line: 20, tracking: 0, tabular: true },
  stickerNo: { family: FONT_FAMILIES.condensedExtraBoldItalic, size: 15, line: 16, tracking: 0 },
};

function toTextStyle(spec: VariantSpec): TextStyle {
  return {
    fontFamily: fontFamily(spec.family),
    fontSize: spec.size,
    lineHeight: spec.line,
    letterSpacing: spec.tracking,
    ...(spec.upper === true ? { textTransform: 'uppercase' } : {}),
    ...(spec.tabular === true ? { fontVariant: ['tabular-nums'] } : {}),
  };
}

/** Ready-to-use text styles per variant (`theme.text`). */
export const textVariants: Record<TextVariant, TextStyle> = {
  hero: toTextStyle(VARIANT_SPECS.hero),
  display: toTextStyle(VARIANT_SPECS.display),
  title: toTextStyle(VARIANT_SPECS.title),
  headline: toTextStyle(VARIANT_SPECS.headline),
  body: toTextStyle(VARIANT_SPECS.body),
  bodyStrong: toTextStyle(VARIANT_SPECS.bodyStrong),
  bodySm: toTextStyle(VARIANT_SPECS.bodySm),
  label: toTextStyle(VARIANT_SPECS.label),
  caption: toTextStyle(VARIANT_SPECS.caption),
  number: toTextStyle(VARIANT_SPECS.number),
  numberSm: toTextStyle(VARIANT_SPECS.numberSm),
  stickerNo: toTextStyle(VARIANT_SPECS.stickerNo),
};

/** The registered (bare) family name of each variant, e.g. for `document.fonts.check`. */
export function variantFamily(variant: TextVariant): FontFamilyName {
  return VARIANT_SPECS[variant].family;
}

/** Big display text may grow with the system font size, but at most 1.4×, so layouts survive. */
export const MAX_FONT_SCALE: Partial<Record<TextVariant, number>> = { hero: 1.4, display: 1.4, title: 1.4 };

/**
 * @deprecated v1 scale, kept only so old components compile until their lanes restyle them. Use
 * the variants instead.
 */
export const fontSizes = { sm: 12, md: 14, lg: 16, xl: 20, xxl: 28 } as const;
/** @deprecated v1 scale; see `fontSizes`. */
export const lineHeights = { sm: 16, md: 20, lg: 24, xl: 28, xxl: 34 } as const;
