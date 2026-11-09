import { View, StyleSheet } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

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
  horizontal: { height: 1, width: '100%' },
  vertical: { width: 1, height: '100%' },
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
