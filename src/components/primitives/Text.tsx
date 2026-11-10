import type { ReactNode } from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import {
  createThemedStyles,
  MAX_FONT_SCALE,
  textVariants,
  type TextTone,
  type TextVariant,
  type ThemeColors,
} from '../../theme';

/** @deprecated v1 sizes; use `variant`. */
type LegacySize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
/** @deprecated v1 weights; use `variant`. */
type LegacyWeight = 'normal' | 'medium' | 'bold';

export interface TextProps {
  children: ReactNode;
  /** Typography variant (SPEC §7.3). Default `body`. */
  variant?: TextVariant;
  /** Colour role. Default `default`. Screens use tones, never colours. */
  tone?: TextTone;
  /** 'auto' (default) follows the reading direction of the language, so the text is RTL-ready. */
  align?: 'auto' | 'left' | 'center' | 'right';
  numberOfLines?: number;
  /** Marks the text as a heading for screen readers (TalkBack / VoiceOver). */
  heading?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  /** @deprecated Mapped to a variant; use `variant`. */
  size?: LegacySize;
  /** @deprecated Mapped to a variant; use `variant`. */
  weight?: LegacyWeight;
  /** For components only (lint-banned in app/**): an explicit colour that wins over the tone. */
  color?: string;
}

export const TONE_TOKENS: Record<TextTone, keyof ThemeColors> = {
  default: 'text',
  muted: 'textMuted',
  subtle: 'textSubtle',
  accent: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  onPrimary: 'onPrimary',
  inverse: 'onInverse',
  onStage: 'onStage',
  onStageMuted: 'onStageMuted',
  onSignal: 'onSignal',
};

/** Maps the deprecated v1 size/weight props onto the closest LIVERY variant. */
export function legacyVariant(size: LegacySize = 'md', weight: LegacyWeight = 'normal'): TextVariant {
  const strong = weight === 'bold';
  switch (size) {
    case 'xxl':
      return 'title';
    case 'xl':
      return 'headline';
    case 'lg':
      return strong ? 'bodyStrong' : 'body';
    case 'md':
      return strong ? 'bodyStrong' : 'bodySm';
    case 'sm':
      return 'caption';
  }
}

export function Text({
  children,
  variant,
  tone = 'default',
  align = 'auto',
  numberOfLines,
  heading = false,
  testID,
  accessibilityLabel,
  size,
  weight,
  color,
}: TextProps) {
  const toneStyles = useToneStyles();
  const resolved: TextVariant =
    variant ?? (size !== undefined || weight !== undefined ? legacyVariant(size, weight) : 'body');
  return (
    <RNText
      style={[textVariants[resolved], toneStyles[tone], alignStyles[align], color !== undefined && { color }]}
      numberOfLines={numberOfLines}
      maxFontSizeMultiplier={MAX_FONT_SCALE[resolved]}
      accessibilityRole={heading ? 'header' : undefined}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </RNText>
  );
}

const useToneStyles = createThemedStyles(({ colors }) => ({
  default: { color: colors[TONE_TOKENS.default] },
  muted: { color: colors[TONE_TOKENS.muted] },
  subtle: { color: colors[TONE_TOKENS.subtle] },
  accent: { color: colors[TONE_TOKENS.accent] },
  success: { color: colors[TONE_TOKENS.success] },
  warning: { color: colors[TONE_TOKENS.warning] },
  danger: { color: colors[TONE_TOKENS.danger] },
  info: { color: colors[TONE_TOKENS.info] },
  onPrimary: { color: colors[TONE_TOKENS.onPrimary] },
  inverse: { color: colors[TONE_TOKENS.inverse] },
  onStage: { color: colors[TONE_TOKENS.onStage] },
  onStageMuted: { color: colors[TONE_TOKENS.onStageMuted] },
  onSignal: { color: colors[TONE_TOKENS.onSignal] },
}));

const alignStyles = StyleSheet.create({
  auto: { textAlign: 'auto' },
  left: { textAlign: 'left' },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
});
