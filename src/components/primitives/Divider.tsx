import { View, StyleSheet } from 'react-native';
import { createThemedStyles, lines, spacing } from '../../theme';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  testID?: string;
}

/** A 1 px hairline in the `line` token, between rows or blocks of content. Decorative. */
export function Divider({ orientation = 'horizontal', spacing: space = 'none', testID }: DividerProps) {
  const styles = useStyles();
  const isHorizontal = orientation === 'horizontal';
  return (
    <View
      style={[
        styles.base,
        isHorizontal ? styles.horizontal : styles.vertical,
        isHorizontal ? verticalMargins[space] : horizontalMargins[space],
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID}
    />
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: { backgroundColor: colors.line },
  horizontal: { height: lines.hairline, width: '100%' },
  vertical: { width: lines.hairline, alignSelf: 'stretch' },
}));

const verticalMargins = StyleSheet.create({
  none: { marginVertical: spacing.none },
  sm: { marginVertical: spacing.sm },
  md: { marginVertical: spacing.md },
  lg: { marginVertical: spacing.lg },
});

const horizontalMargins = StyleSheet.create({
  none: { marginHorizontal: spacing.none },
  sm: { marginHorizontal: spacing.sm },
  md: { marginHorizontal: spacing.md },
  lg: { marginHorizontal: spacing.lg },
});
