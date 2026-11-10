import { View, StyleSheet } from 'react-native';
import { borders, createThemedStyles, spacing } from '../../theme';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

/** A hairline between blocks of content. */
export function Divider({ orientation = 'horizontal', spacing: space = 'none' }: DividerProps) {
  const styles = useStyles();
  const isHorizontal = orientation === 'horizontal';
  return (
    <View
      style={[
        styles.base,
        isHorizontal ? styles.horizontal : styles.vertical,
        isHorizontal ? verticalMargins[space] : horizontalMargins[space],
      ]}
    />
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: { backgroundColor: colors.border },
  horizontal: { height: borders.hairline, width: '100%' },
  vertical: { width: borders.hairline, height: '100%' },
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
