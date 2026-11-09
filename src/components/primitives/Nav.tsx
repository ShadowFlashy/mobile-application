import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';

interface NavProps {
  children: React.ReactNode;
  /** Extra bottom padding, e.g. the safe-area inset on phones with a gesture bar. */
  bottomInset?: number;
  testID?: string;
}

/** Bottom navigation bar: placed in the thumb zone (course chapter 3, touch-friendliness). */
export function Nav({ children, bottomInset = 0, testID }: NavProps) {
  const styles = useStyles();
  return (
    <View
      style={[styles.base, { paddingBottom: spacing.xs + bottomInset }]}
      accessibilityRole="tablist"
      testID={testID}
    >
      {children}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
}));
