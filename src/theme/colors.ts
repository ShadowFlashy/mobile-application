/**
 * LIVERY colour tokens (SPEC §7.2): two schemes, Paddock Paper (light) and Night Session (dark).
 *
 * Every component reads colours through `useTheme()`, never hardcoded. Text tokens reach WCAG AA
 * (4.5:1) on every surface they are used on; `cypress/unit/foundation/contrast.cy.ts` re-checks all
 * pairs. Rule of one red: `primary` is a fill only (the main action, the Ignition button, the active
 * tab and the red zone of gauges); red text and icons use `accent`.
 */
export interface ThemeColors {
  /** Screen background. */
  background: string;
  /** Cards. */
  surface: string;
  /** Chips, muted cards. */
  surfaceMuted: string;
  /** Album slot wells, LEDs that are off. */
  surfaceSunken: string;
  /** Hairlines. */
  border: string;
  /** Inputs, dashed slots. */
  borderStrong: string;
  /** Cut line of an album slot. */
  slotOutline: string;
  /** Car silhouettes in empty slots. */
  silhouette: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  /** Fill only (white on it 4.97:1). */
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  /** Red text and icons. */
  accent: string;
  /** Selected chips. */
  primarySoft: string;
  success: string;
  successSoft: string;
  /** Background for white text. */
  successFill: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  /** Background for white text. */
  dangerFill: string;
  info: string;
  infoSoft: string;
  /** Marshal yellow, fill only: XP, AUTO tags, focus on dark. */
  signal: string;
  onSignal: string;
  /** Toasts and the offline banner. */
  inverseSurface: string;
  onInverse: string;
  /** Always-dark backdrop of capture and reveal. */
  stage: string;
  onStage: string;
  onStageMuted: string;
  photoBackdrop: string;
  /** Modal scrim. */
  overlay: string;
  /** Photo gradient, transparent end. */
  scrimTop: string;
  /** Photo gradient, dark end. */
  scrimBottom: string;
  /** Box fill in the plate editor. */
  redactionBox: string;
  redactionBorder: string;
  focusRing: string;
}

export interface RarityColors {
  background: string;
  text: string;
}

export type RarityPalette = Record<'common' | 'rare' | 'epic' | 'legendary', RarityColors>;

export const lightColors: ThemeColors = {
  background: '#F4F1EA',
  surface: '#FFFFFF',
  surfaceMuted: '#EAE6DC',
  surfaceSunken: '#E3DED2',
  border: '#DAD4C7',
  borderStrong: '#B9B1A1',
  slotOutline: '#B9B1A1',
  silhouette: '#CFC8B8',
  text: '#15171C',
  textMuted: '#4A4E57',
  textSubtle: '#5E626B',
  primary: '#E10600',
  primaryPressed: '#B80500',
  onPrimary: '#FFFFFF',
  accent: '#C40500',
  primarySoft: '#FFE3E0',
  success: '#086A36',
  successSoft: '#DDF3E6',
  successFill: '#086A36',
  warning: '#9A4A00',
  warningSoft: '#FFF1DB',
  danger: '#A3112E',
  dangerSoft: '#FDE4E8',
  dangerFill: '#A3112E',
  info: '#1F4FD8',
  infoSoft: '#E1EBFF',
  signal: '#FFD400',
  onSignal: '#111111',
  inverseSurface: '#15171C',
  onInverse: '#FFFFFF',
  stage: '#0B0C0F',
  onStage: '#F3F1EC',
  onStageMuted: '#B7BAC2',
  photoBackdrop: '#0B0C0F',
  overlay: 'rgba(10,11,14,0.60)',
  scrimTop: 'rgba(11,12,15,0)',
  scrimBottom: 'rgba(11,12,15,0.85)',
  redactionBox: 'rgba(225,6,0,0.30)',
  redactionBorder: '#E10600',
  focusRing: '#1F4FD8',
};

export const darkColors: ThemeColors = {
  background: '#0D0E11',
  surface: '#16181D',
  surfaceMuted: '#1F2228',
  surfaceSunken: '#0A0B0D',
  border: '#2A2D35',
  borderStrong: '#3D414B',
  slotOutline: '#3D414B',
  silhouette: '#2E323B',
  text: '#F3F1EC',
  textMuted: '#B7BAC2',
  textSubtle: '#8D919B',
  primary: '#E10600',
  primaryPressed: '#B80500',
  onPrimary: '#FFFFFF',
  accent: '#FF5A4F',
  primarySoft: '#3A0D0B',
  success: '#3DDC84',
  successSoft: '#0E2E1C',
  successFill: '#086A36',
  warning: '#FFB547',
  warningSoft: '#3A2600',
  danger: '#FF6B8A',
  dangerSoft: '#3B0F18',
  dangerFill: '#A3112E',
  info: '#7AA7FF',
  infoSoft: '#0E2440',
  signal: '#FFD400',
  onSignal: '#111111',
  inverseSurface: '#F3F1EC',
  onInverse: '#0D0E11',
  stage: '#050506',
  onStage: '#F3F1EC',
  onStageMuted: '#B7BAC2',
  photoBackdrop: '#000000',
  overlay: 'rgba(0,0,0,0.70)',
  scrimTop: 'rgba(11,12,15,0)',
  scrimBottom: 'rgba(11,12,15,0.85)',
  redactionBox: 'rgba(255,90,79,0.35)',
  redactionBorder: '#FF5A4F',
  focusRing: '#FFD400',
};

/** Rarity chips (background / text), all at least 6.5:1. Labels are i18n (`rarity.*`). */
export const lightRarity: RarityPalette = {
  common: { background: '#E6E1D6', text: '#3B3F47' },
  rare: { background: '#E3E8EE', text: '#2D3A4A' },
  epic: { background: '#EFE4FF', text: '#5B21B6' },
  legendary: { background: '#FFF0C7', text: '#7A4B00' },
};

export const darkRarity: RarityPalette = {
  common: { background: '#2A2D35', text: '#E6E1D6' },
  rare: { background: '#2B3440', text: '#DCE3EB' },
  epic: { background: '#3B2470', text: '#E9DDFF' },
  legendary: { background: '#4A3205', text: '#FFE7A3' },
};

/** Tokens that are used as text colours (see `TextTone` in typography.ts). */
export type TextColorToken =
  | 'text'
  | 'textMuted'
  | 'textSubtle'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'onPrimary'
  | 'onInverse'
  | 'onStage'
  | 'onStageMuted'
  | 'onSignal';

/**
 * Every text/background pair that LIVERY promises at ≥ 4.5:1 (SPEC §7.2). Exported so the contrast
 * unit test checks exactly the documented list.
 */
export const CONTRAST_PAIRS: readonly { text: keyof ThemeColors; background: keyof ThemeColors }[] = [
  ...(['text', 'textMuted', 'textSubtle', 'accent', 'success', 'warning', 'danger', 'info'] as const).flatMap((text) =>
    (['background', 'surface', 'surfaceMuted', 'surfaceSunken'] as const).map((background) => ({ text, background })),
  ),
  { text: 'accent', background: 'primarySoft' },
  { text: 'success', background: 'successSoft' },
  { text: 'warning', background: 'warningSoft' },
  { text: 'danger', background: 'dangerSoft' },
  { text: 'info', background: 'infoSoft' },
  { text: 'onPrimary', background: 'primary' },
  { text: 'onPrimary', background: 'primaryPressed' },
  { text: 'onPrimary', background: 'successFill' },
  { text: 'onPrimary', background: 'dangerFill' },
  { text: 'onInverse', background: 'inverseSurface' },
  { text: 'onStage', background: 'stage' },
  { text: 'onStageMuted', background: 'stage' },
  { text: 'onSignal', background: 'signal' },
];
