/**
 * Colour schemes of Redline (style guide, course ch. 3).
 *
 * Every component reads colours through `useTheme()`, never hardcoded, so the app follows the
 * system light / dark mode (course ch. 19.2.1). Text colours reach WCAG AA (4.5:1) on the
 * surfaces they are used on; `*Fill` colours are backgrounds for white text.
 */
export interface ThemeColors {
  /** Filled buttons, selected chips, progress bars (white text on top). */
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  /** Brand colour for text and icons on normal surfaces. */
  accent: string;
  primarySoft: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  /** Dark-on-light / light-on-dark surface for toasts and the offline banner. */
  inverseSurface: string;
  onInverse: string;
  success: string;
  successSoft: string;
  successFill: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  dangerFill: string;
  info: string;
  infoSoft: string;
  overlay: string;
  redactionBox: string;
  photoBackdrop: string;
}

export interface RarityColors {
  background: string;
  text: string;
}

export type RarityPalette = Record<'common' | 'rare' | 'epic' | 'legendary', RarityColors>;

export const lightColors: ThemeColors = {
  primary: '#B91C1C',
  primaryPressed: '#991B1B',
  onPrimary: '#FFFFFF',
  accent: '#B91C1C',
  primarySoft: '#FEE2E2',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  text: '#0F172A',
  textMuted: '#475569',
  textSubtle: '#64748B',
  inverseSurface: '#0F172A',
  onInverse: '#FFFFFF',
  success: '#15803D',
  successSoft: '#DCFCE7',
  successFill: '#15803D',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  danger: '#9F1239',
  dangerSoft: '#FFE4E6',
  dangerFill: '#9F1239',
  info: '#1D4ED8',
  infoSoft: '#DBEAFE',
  overlay: 'rgba(15, 23, 42, 0.55)',
  redactionBox: 'rgba(185, 28, 28, 0.35)',
  photoBackdrop: '#0F172A',
};

export const darkColors: ThemeColors = {
  primary: '#B91C1C',
  primaryPressed: '#991B1B',
  onPrimary: '#FFFFFF',
  accent: '#F87171',
  primarySoft: '#450A0A',
  background: '#0B1120',
  surface: '#111827',
  surfaceMuted: '#1E293B',
  border: '#1E293B',
  borderStrong: '#475569',
  text: '#F1F5F9',
  textMuted: '#CBD5E1',
  textSubtle: '#94A3B8',
  inverseSurface: '#F1F5F9',
  onInverse: '#0F172A',
  success: '#4ADE80',
  successSoft: '#052E16',
  successFill: '#15803D',
  warning: '#FBBF24',
  warningSoft: '#451A03',
  danger: '#FB7185',
  dangerSoft: '#4C0519',
  dangerFill: '#9F1239',
  info: '#60A5FA',
  infoSoft: '#172554',
  overlay: 'rgba(0, 0, 0, 0.65)',
  redactionBox: 'rgba(248, 113, 113, 0.35)',
  photoBackdrop: '#020617',
};

export const lightRarity: RarityPalette = {
  common: { background: '#E2E8F0', text: '#334155' },
  rare: { background: '#DBEAFE', text: '#1E40AF' },
  epic: { background: '#EDE9FE', text: '#5B21B6' },
  legendary: { background: '#FEF3C7', text: '#92400E' },
};

export const darkRarity: RarityPalette = {
  common: { background: '#334155', text: '#F1F5F9' },
  rare: { background: '#1E3A8A', text: '#DBEAFE' },
  epic: { background: '#4C1D95', text: '#EDE9FE' },
  legendary: { background: '#78350F', text: '#FEF3C7' },
};
