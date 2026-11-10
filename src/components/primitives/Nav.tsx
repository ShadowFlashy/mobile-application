import type { ReactNode } from 'react';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';

interface NavProps {
  children: ReactNode;
  /** Extra bottom padding, e.g. the safe-area inset on phones with a gesture bar. */
  bottomInset?: number;
  testID?: string;
}

/** Bottom navigation bar in the thumb zone. Items may rise above it (the Ignition button). */
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

const useStyles = createThemedStyles(({ colors, elevation }) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    ...elevation.lifted,
  },
}));
