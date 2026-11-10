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
  /** Direction A type style (see A-FOUNDATION.md). Default `body`. */
  variant?: TextVariant;
  /** Colour role: `text` (default), `text2`, `inverse` (on a text-colour fill), `onRed`. */
  tone?: TextTone;
  /** 'auto' (default) follows the reading direction of the language, so the text is RTL-ready. */
  align?: 'auto' | 'left' | 'center' | 'right';
  numberOfLines?: number;
  /** Marks the text as a heading for screen readers (TalkBack / VoiceOver). */
  heading?: boolean;
  /** Heading level on the web: 1 for the screen title, 2 for sections and sheets. Default 1. */
  level?: 1 | 2 | 3;
  testID?: string;
  /** The element id on the web, e.g. for a control's `aria-describedby`. */
  nativeID?: string;
  accessibilityLabel?: string;
  /** Hides decorative text from screen readers (e.g. a roundel letter next to its spelled tier). */
  decorative?: boolean;
  /** @deprecated Mapped to a variant; use `variant`. */
  size?: LegacySize;
  /** @deprecated Mapped to a variant; use `variant`. */
  weight?: LegacyWeight;
  /** For components only (lint-banned in app/**): an explicit colour that wins over the tone. */
  color?: string;
}

/** The colour token behind every tone. Deprecated LIVERY tones resolve to the A tone of their role. */
export const TONE_TOKENS: Record<TextTone, keyof ThemeColors> = {
  text: 'text',
  text2: 'text2',
  inverse: 'onInverse',
  onRed: 'onRed',
  onStage: 'onStage',
  onStageMuted: 'onStageMuted',
  default: 'text',
  muted: 'text2',
  subtle: 'text2',
  accent: 'text',
  success: 'text',
  warning: 'text',
  danger: 'text',
  info: 'text',
  onPrimary: 'onRed',
  onSignal: 'onInverse',
};

/** Maps the deprecated v1 size/weight props onto the closest A variant. */
export function legacyVariant(size: LegacySize = 'md', weight: LegacyWeight = 'normal'): TextVariant {
  const strong = weight === 'bold';
  switch (size) {
    case 'xxl':
      return 'title';
    case 'xl':
      return 'heading';
    case 'lg':
      return strong ? 'heading' : 'bodyL';
    case 'md':
      return strong ? 'body' : 'value';
    case 'sm':
      return 'meta';
  }
}

/** Every text in the app: A's type scale, a colour role and, optionally, heading semantics. */
export function Text({
  children,
  variant,
  tone = 'text',
  align = 'auto',
  numberOfLines,
  heading = false,
  level,
  testID,
  nativeID,
  accessibilityLabel,
  decorative = false,
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
      aria-level={heading ? level : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={decorative ? true : undefined}
      importantForAccessibility={decorative ? 'no-hide-descendants' : undefined}
      aria-hidden={decorative ? true : undefined}
      testID={testID}
      nativeID={nativeID}
    >
      {children}
    </RNText>
  );
}

const useToneStyles = createThemedStyles(({ colors }) => ({
  text: { color: colors[TONE_TOKENS.text] },
  text2: { color: colors[TONE_TOKENS.text2] },
  inverse: { color: colors[TONE_TOKENS.inverse] },
  onRed: { color: colors[TONE_TOKENS.onRed] },
  onStage: { color: colors[TONE_TOKENS.onStage] },
  onStageMuted: { color: colors[TONE_TOKENS.onStageMuted] },
  default: { color: colors[TONE_TOKENS.default] },
  muted: { color: colors[TONE_TOKENS.muted] },
  subtle: { color: colors[TONE_TOKENS.subtle] },
  accent: { color: colors[TONE_TOKENS.accent] },
  success: { color: colors[TONE_TOKENS.success] },
  warning: { color: colors[TONE_TOKENS.warning] },
  danger: { color: colors[TONE_TOKENS.danger] },
  info: { color: colors[TONE_TOKENS.info] },
  onPrimary: { color: colors[TONE_TOKENS.onPrimary] },
  onSignal: { color: colors[TONE_TOKENS.onSignal] },
}));

const alignStyles = StyleSheet.create({
  auto: { textAlign: 'auto' },
  left: { textAlign: 'left' },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
});
