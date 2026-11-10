import { useContext, type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { createThemedStyles, spacing } from '../../theme';

interface StickyFooterProps {
  children: ReactNode;
  testID?: string;
}

/** Bottom action bar above the safe-area inset, on a surface with a top hairline. */
export function StickyFooter({ children, testID }: StickyFooterProps) {
  const styles = useStyles();
  // The context instead of the hook, so the footer also renders without a SafeAreaProvider (tests, stories).
  const insets = useContext(SafeAreaInsetsContext);
  return (
    <View style={[styles.footer, { paddingBottom: spacing.smd + (insets?.bottom ?? 0) }]} testID={testID}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, elevation }) => ({
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.smd,
    paddingHorizontal: spacing.md,
    ...elevation.lifted,
  },
  inner: { width: '100%', maxWidth: 720, alignSelf: 'center' },
}));
