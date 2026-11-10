import { useContext, type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { createThemedStyles, lines, spacing } from '../../theme';
import { Text } from './Text';

interface StickyFooterProps {
  /** Full-width content (one or more full-width buttons). Ignored when `action` is set. */
  children?: ReactNode;
  /**
   * Compact footer: a one-line reason or result on the left ("Check the plates first",
   * "#31 · +125 XP") and the action (a StyledButton) on the right.
   */
  action?: ReactNode;
  reason?: string;
  /** `text2` (default) for a reason, `text` for a result. */
  reasonTone?: 'text' | 'text2';
  /** testID of the reason text, e.g. for `aria-describedby`-style checks in tests. */
  reasonTestID?: string;
  testID?: string;
}

/**
 * A's bottom bar: the background colour with a hairline on top, 20 px margins and the bottom
 * safe-area inset. Compact (reason left, action right) or full width (children).
 */
export function StickyFooter({
  children,
  action,
  reason,
  reasonTone = 'text2',
  reasonTestID,
  testID,
}: StickyFooterProps) {
  const styles = useStyles();
  // The context instead of the hook, so the footer also renders without a SafeAreaProvider (tests, stories).
  const insets = useContext(SafeAreaInsetsContext);
  const isCompact = action !== undefined;
  return (
    <View style={[styles.footer, { paddingBottom: spacing.smd + (insets?.bottom ?? 0) }]} testID={testID}>
      <View style={[styles.inner, isCompact && styles.compact]}>
        {isCompact ? (
          <>
            <View style={styles.reason}>
              {reason !== undefined && (
                <Text variant="body" tone={reasonTone} numberOfLines={2} testID={reasonTestID}>
                  {reason}
                </Text>
              )}
            </View>
            {action}
          </>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  footer: {
    backgroundColor: colors.bg,
    borderTopWidth: lines.hairline,
    borderTopColor: colors.line,
    paddingTop: spacing.smd,
    paddingHorizontal: spacing.gutter,
  },
  inner: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.sm },
  compact: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  reason: { flex: 1, minWidth: 0 },
}));
