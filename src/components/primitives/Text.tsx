import { Text as RNText, StyleSheet } from 'react-native';
import { createThemedStyles, fontSizes, lineHeights } from '../../theme';

interface TextProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'normal' | 'medium' | 'bold';
  color?: string;
  /** 'auto' (default) follows the reading direction of the language, so the text is RTL-ready. */
  align?: 'auto' | 'left' | 'center' | 'right';
  numberOfLines?: number;
  /** Marks the text as a heading for screen readers (TalkBack / VoiceOver). */
  heading?: boolean;
  testID?: string;
}

export function Text({
  children,
  size = 'md',
  weight = 'normal',
  color,
  align = 'auto',
  numberOfLines,
  heading = false,
  testID,
}: TextProps) {
  const themed = useStyles();
  return (
    <RNText
      style={[themed.base, styles[size], styles[weight], alignStyles[align], color !== undefined && { color }]}
      numberOfLines={numberOfLines}
      accessibilityRole={heading ? 'header' : undefined}
      testID={testID}
    >
      {children}
    </RNText>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: { color: colors.text },
}));

const styles = StyleSheet.create({
  sm: { fontSize: fontSizes.sm, lineHeight: lineHeights.sm },
  md: { fontSize: fontSizes.md, lineHeight: lineHeights.md },
  lg: { fontSize: fontSizes.lg, lineHeight: lineHeights.lg },
  xl: { fontSize: fontSizes.xl, lineHeight: lineHeights.xl },
  xxl: { fontSize: fontSizes.xxl, lineHeight: lineHeights.xxl },
  normal: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  bold: { fontWeight: '700' },
});

const alignStyles = StyleSheet.create({
  auto: { textAlign: 'auto' },
  left: { textAlign: 'left' },
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
});
