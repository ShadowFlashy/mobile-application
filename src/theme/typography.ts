import { Platform, type TextStyle } from 'react-native';

/**
 * Direction A typography: Barlow Condensed (500, 600) for numerals, sticker numbers and screen
 * titles, Barlow (400, 500, 600) for everything else. Upright only, sentence case (no uppercase
 * transforms) and tabular figures on every variant. Variants set `fontFamily` only, never
 * `fontWeight` (Android ignores the weight of custom families). The faces are loaded by
 * `useAppFonts` (fonts.ts) in the app and by fonts.css in Storybook and Cypress.
 */
export const FONT_FAMILIES = {
  regular: 'Barlow_400Regular',
  medium: 'Barlow_500Medium',
  semibold: 'Barlow_600SemiBold',
  condensedMedium: 'BarlowCondensed_500Medium',
  condensedSemibold: 'BarlowCondensed_600SemiBold',
} as const;

export type FontFamilyName = (typeof FONT_FAMILIES)[keyof typeof FONT_FAMILIES];

const CONDENSED_FALLBACK = '"Arial Narrow", system-ui, sans-serif';
const TEXT_FALLBACK = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** CSS fallback stacks for the web, so text stays readable while the TTFs load. */
const WEB_FALLBACK: Record<FontFamilyName, string> = {
  Barlow_400Regular: TEXT_FALLBACK,
  Barlow_500Medium: TEXT_FALLBACK,
  Barlow_600SemiBold: TEXT_FALLBACK,
  BarlowCondensed_500Medium: CONDENSED_FALLBACK,
  BarlowCondensed_600SemiBold: CONDENSED_FALLBACK,
};

/** The family to put in a style: the bare registered name on native, a fallback stack on the web. */
export function fontFamily(name: FontFamilyName): string {
  return Platform.select({ web: `${name}, ${WEB_FALLBACK[name]}`, default: name });
}

/** Direction A's type scale (A-NOTES "Type"). */
export const A_TEXT_VARIANTS = [
  'hero',
  'heroSub',
  'title',
  'unit',
  'num',
  'numS',
  'mark',
  'heading',
  'bodyL',
  'body',
  'value',
  'meta',
  'tab',
  'button',
] as const;
export type ATextVariant = (typeof A_TEXT_VARIANTS)[number];

/**
 * @deprecated LIVERY variant names, kept as aliases of A variants so old call sites compile until
 * their area is restyled: display → title, headline → heading, bodyStrong → bodyL, bodySm → value,
 * label → meta, caption → meta, number → title, numberSm → num, stickerNo → num.
 */
export const LEGACY_TEXT_VARIANTS = [
  'display',
  'headline',
  'bodyStrong',
  'bodySm',
  'label',
  'caption',
  'number',
  'numberSm',
  'stickerNo',
] as const;
export type LegacyTextVariant = (typeof LEGACY_TEXT_VARIANTS)[number];

/** Every variant name the Text primitive accepts (A names first, then the deprecated aliases). */
export const TEXT_VARIANTS = [...A_TEXT_VARIANTS, ...LEGACY_TEXT_VARIANTS] as const;
export type TextVariant = ATextVariant | LegacyTextVariant;

/** The A variant a deprecated alias resolves to. */
export const LEGACY_VARIANT_MAP: Record<LegacyTextVariant, ATextVariant> = {
  display: 'title',
  headline: 'heading',
  bodyStrong: 'bodyL',
  bodySm: 'value',
  label: 'meta',
  caption: 'meta',
  number: 'title',
  numberSm: 'num',
  stickerNo: 'num',
};

/**
 * Text tones: the colour role of a text, resolved to a colour token by the Text primitive.
 * A tones: `text` (default), `text2` (secondary), `inverse` (on a text-colour fill), `onRed` (on
 * red), `onStage` and `onStageMuted` (on the always-dark photo stage). The rest are deprecated
 * LIVERY tones that resolve to the A tone of the same role.
 */
export const TEXT_TONES = [
  'text',
  'text2',
  'inverse',
  'onRed',
  'onStage',
  'onStageMuted',
  // Deprecated aliases.
  'default',
  'muted',
  'subtle',
  'accent',
  'success',
  'warning',
  'danger',
  'info',
  'onPrimary',
  'onSignal',
] as const;
export type TextTone = (typeof TEXT_TONES)[number];

interface VariantSpec {
  family: FontFamilyName;
  size: number;
  line: number;
  tracking: number;
}

const A_SPECS: Record<ATextVariant, VariantSpec> = {
  hero: { family: FONT_FAMILIES.condensedSemibold, size: 80, line: 72, tracking: -1 },
  heroSub: { family: FONT_FAMILIES.condensedMedium, size: 32, line: 36, tracking: 0 },
  title: { family: FONT_FAMILIES.condensedSemibold, size: 34, line: 40, tracking: 0 },
  unit: { family: FONT_FAMILIES.condensedMedium, size: 20, line: 24, tracking: 0 },
  num: { family: FONT_FAMILIES.condensedSemibold, size: 17, line: 20, tracking: 0 },
  numS: { family: FONT_FAMILIES.condensedMedium, size: 15, line: 20, tracking: 0 },
  mark: { family: FONT_FAMILIES.condensedSemibold, size: 12, line: 12, tracking: 0 },
  heading: { family: FONT_FAMILIES.semibold, size: 17, line: 24, tracking: 0 },
  bodyL: { family: FONT_FAMILIES.medium, size: 17, line: 24, tracking: 0 },
  body: { family: FONT_FAMILIES.medium, size: 15, line: 20, tracking: 0 },
  value: { family: FONT_FAMILIES.regular, size: 15, line: 20, tracking: 0 },
  meta: { family: FONT_FAMILIES.regular, size: 13, line: 18, tracking: 0 },
  tab: { family: FONT_FAMILIES.medium, size: 11, line: 14, tracking: 0 },
  button: { family: FONT_FAMILIES.semibold, size: 17, line: 24, tracking: 0 },
};

function specOf(variant: TextVariant): VariantSpec {
  switch (variant) {
    case 'display':
    case 'headline':
    case 'bodyStrong':
    case 'bodySm':
    case 'label':
    case 'caption':
    case 'number':
    case 'numberSm':
    case 'stickerNo':
      return A_SPECS[LEGACY_VARIANT_MAP[variant]];
    default:
      return A_SPECS[variant];
  }
}

function toTextStyle(spec: VariantSpec): TextStyle {
  return {
    fontFamily: fontFamily(spec.family),
    fontSize: spec.size,
    lineHeight: spec.line,
    letterSpacing: spec.tracking,
    // Tabular figures on every number, so counts and times line up in columns.
    fontVariant: ['tabular-nums'],
  };
}

function buildVariants(): Record<TextVariant, TextStyle> {
  const style = (variant: TextVariant): TextStyle => toTextStyle(specOf(variant));
  return {
    hero: style('hero'),
    heroSub: style('heroSub'),
    title: style('title'),
    unit: style('unit'),
    num: style('num'),
    numS: style('numS'),
    mark: style('mark'),
    heading: style('heading'),
    bodyL: style('bodyL'),
    body: style('body'),
    value: style('value'),
    meta: style('meta'),
    tab: style('tab'),
    button: style('button'),
    display: style('display'),
    headline: style('headline'),
    bodyStrong: style('bodyStrong'),
    bodySm: style('bodySm'),
    label: style('label'),
    caption: style('caption'),
    number: style('number'),
    numberSm: style('numberSm'),
    stickerNo: style('stickerNo'),
  };
}

/** Ready-to-use text styles per variant (`theme.text`). */
export const textVariants: Record<TextVariant, TextStyle> = buildVariants();

/** The registered (bare) family name of each variant, e.g. for `document.fonts.check`. */
export function variantFamily(variant: TextVariant): FontFamilyName {
  return specOf(variant).family;
}

/** The A variant a name resolves to (itself for A names). */
export function resolveVariant(variant: TextVariant): ATextVariant {
  switch (variant) {
    case 'display':
    case 'headline':
    case 'bodyStrong':
    case 'bodySm':
    case 'label':
    case 'caption':
    case 'number':
    case 'numberSm':
    case 'stickerNo':
      return LEGACY_VARIANT_MAP[variant];
    default:
      return variant;
  }
}

/** Big display text may grow with the system font size, but only so far, so layouts survive. */
export const MAX_FONT_SCALE: Partial<Record<TextVariant, number>> = {
  hero: 1.2,
  heroSub: 1.3,
  title: 1.3,
  display: 1.3,
  number: 1.3,
  // Figures sit in fixed columns and the roundel letter in a fixed disc: they grow less (or not).
  num: 1.3,
  numS: 1.3,
  mark: 1,
  tab: 1.3,
};

/**
 * @deprecated v1 scale, kept only so old components compile until their lanes restyle them. Use
 * the variants instead.
 */
export const fontSizes = { sm: 13, md: 15, lg: 17, xl: 20, xxl: 34 } as const;
/** @deprecated v1 scale; see `fontSizes`. */
export const lineHeights = { sm: 18, md: 20, lg: 24, xl: 24, xxl: 40 } as const;
