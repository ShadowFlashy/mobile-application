import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { createThemedStyles, useTheme } from '../../theme';
import { paddingStyles } from './layout';
import { StickyFooter } from './StickyFooter';

interface ScreenProps {
  children: ReactNode;
  /** `paper` (default) follows the scheme; `stage` is the always-dark capture/reveal backdrop. */
  variant?: 'paper' | 'stage';
  /** Default `md`. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Default true. */
  scrollable?: boolean;
  /** Rendered in a StickyFooter under the content (e.g. the COLLECT bar). */
  footer?: ReactNode;
  /** Pull to refresh (scrollable screens only). */
  refreshing?: boolean;
  onRefresh?: () => void;
  testID?: string;
}

/**
 * Root wrapper for every screen. Content is centred with a max width so the PWA also looks good on
 * a tablet or desktop browser, while phones use the full width.
 */
export function Screen({
  children,
  variant = 'paper',
  padding = 'md',
  scrollable = true,
  footer,
  refreshing,
  onRefresh,
  testID,
}: ScreenProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const background = variant === 'stage' ? styles.stage : styles.paper;

  const body = scrollable ? (
    <ScrollView
      style={[styles.flex, background]}
      contentContainerStyle={[styles.content, paddingStyles[padding]]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh !== undefined ? (
          <RefreshControl
            refreshing={refreshing === true}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      testID={testID}
    >
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[styles.flex, background, paddingStyles[padding]]} testID={testID}>
      <View style={styles.inner}>{children}</View>
    </View>
  );

  if (footer === undefined) return body;
  return (
    <View style={[styles.flex, background]}>
      {body}
      <StickyFooter testID={testID !== undefined ? `${testID}-footer` : undefined}>{footer}</StickyFooter>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  flex: { flex: 1 },
  paper: { backgroundColor: colors.background },
  stage: { backgroundColor: colors.stage },
  content: { flexGrow: 1 },
  inner: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
}));
