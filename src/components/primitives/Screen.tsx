import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { createThemedStyles, spacing, useTheme } from '../../theme';
import { ScreenTitle } from './ScreenTitle';
import { StickyFooter } from './StickyFooter';

interface ScreenProps {
  children: ReactNode;
  /** A's large condensed screen title ("Album", "New spot"), announced as a header. */
  title?: string;
  /** A quiet meta on the right of the title, on its baseline ("2-week streak"). */
  meta?: string;
  /** A trailing action instead of the meta, e.g. a close IconButton. */
  headerAction?: ReactNode;
  /**
   * `default` follows the colour scheme. `stage` is the always-dark photo stage (camera, full-bleed
   * photos). `paper` is the deprecated name of `default`.
   */
  variant?: 'default' | 'paper' | 'stage';
  /** Side margins. `md` (default) is A's 20 px left edge; `none` for full-bleed content. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Default true. */
  scrollable?: boolean;
  /** Rendered in a StickyFooter under the content (e.g. the "Add to album" bar). */
  footer?: ReactNode;
  /** Pull to refresh (scrollable screens only). */
  refreshing?: boolean;
  onRefresh?: () => void;
  testID?: string;
}

/** Horizontal margin and bottom breathing room per padding option. */
const PADDING = {
  none: { paddingHorizontal: spacing.none, paddingTop: spacing.none, paddingBottom: spacing.none },
  sm: { paddingHorizontal: spacing.smd, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  md: { paddingHorizontal: spacing.gutter, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  lg: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl },
} as const;

/**
 * Root wrapper for every screen: the background colour, A's header (optional), the 20 px side
 * margins, and a centred column with a max width so the PWA also reads well on a tablet. The top
 * safe area is applied once by AppProviders; the bottom one by the tab bar or the StickyFooter.
 */
export function Screen({
  children,
  title,
  meta,
  headerAction,
  variant = 'default',
  padding = 'md',
  scrollable = true,
  footer,
  refreshing,
  onRefresh,
  testID,
}: ScreenProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const isStage = variant === 'stage';
  const background = isStage ? styles.stage : styles.paper;
  const header =
    title !== undefined ? (
      <ScreenTitle title={title} meta={meta} action={headerAction} tone={isStage ? 'onStage' : 'text'} />
    ) : null;

  const body = scrollable ? (
    <ScrollView
      style={[styles.flex, background]}
      contentContainerStyle={[styles.content, PADDING[padding]]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh !== undefined ? (
          <RefreshControl
            refreshing={refreshing === true}
            onRefresh={onRefresh}
            tintColor={colors.text2}
            colors={[colors.text]}
          />
        ) : undefined
      }
      testID={testID}
    >
      <View style={styles.inner}>
        {header}
        {children}
      </View>
    </ScrollView>
  ) : (
    <View style={[styles.flex, background, PADDING[padding]]} testID={testID}>
      <View style={styles.inner}>
        {header}
        {children}
      </View>
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
  paper: { backgroundColor: colors.bg },
  stage: { backgroundColor: colors.stage },
  content: { flexGrow: 1 },
  inner: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
}));
