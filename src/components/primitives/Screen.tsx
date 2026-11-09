import { ScrollView, View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';

interface ScreenProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  scrollable?: boolean;
  testID?: string;
}

/**
 * Root wrapper for every screen. Content is centred with a max width so the PWA
 * also looks good on a tablet or desktop browser, while phones use the full width.
 */
export function Screen({ children, padding = 'md', scrollable = true, testID }: ScreenProps) {
  const styles = useStyles();

  if (!scrollable) {
    return (
      <View style={[styles.container, styles[padding]]} testID={testID}>
        <View style={styles.inner}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, styles[padding]]}
      keyboardShouldPersistTaps="handled"
      testID={testID}
    >
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1 },
  inner: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
  none: { padding: spacing.none },
  sm: { padding: spacing.sm },
  md: { padding: spacing.md },
  lg: { padding: spacing.lg },
}));
