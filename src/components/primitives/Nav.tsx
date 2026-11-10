import type { ReactNode } from 'react';
import { View } from 'react-native';
import { createThemedStyles, lines, spacing } from '../../theme';

interface NavProps {
  children: ReactNode;
  /** Extra bottom padding, e.g. the safe-area inset on phones with a gesture bar. */
  bottomInset?: number;
  /** Spoken name of the tab list. */
  accessibilityLabel?: string;
  testID?: string;
}

/** A's bottom tab bar in the thumb zone: the background colour with a hairline on top. No shadow. */
export function Nav({ children, bottomInset = 0, accessibilityLabel, testID }: NavProps) {
  const styles = useStyles();
  return (
    <View
      style={[styles.base, { paddingBottom: spacing.xs + bottomInset }]}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.bg,
    borderTopWidth: lines.hairline,
    borderTopColor: colors.line,
    paddingTop: spacing.xs + 3,
    paddingHorizontal: spacing.sm,
  },
}));
