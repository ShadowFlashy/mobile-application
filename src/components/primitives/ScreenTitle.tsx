import type { ReactNode } from 'react';
import { View } from 'react-native';
import { createThemedStyles, rowHeights, spacing } from '../../theme';
import { Text } from './Text';

interface ScreenTitleProps {
  /** Already translated; Barlow Condensed 600 34/40, announced as a header. */
  title: string;
  /** A quiet text-2 meta on the right, on the title's baseline ("2-week streak"). */
  meta?: string;
  /** A trailing action instead of the meta (a close IconButton, a text action). */
  action?: ReactNode;
  /** `onStage` on the always-dark photo stage. */
  tone?: 'text' | 'onStage';
  testID?: string;
}

/**
 * A's screen header row: a large condensed title on the left with a quiet meta (or an action) on the
 * right, on one baseline. It sits at the top of the screen content, on the 20 px left edge.
 */
export function ScreenTitle({ title, meta, action, tone = 'text', testID = 'screen-title' }: ScreenTitleProps) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <View style={styles.title}>
        <Text variant="title" tone={tone} heading level={1} testID={testID}>
          {title}
        </Text>
      </View>
      {meta !== undefined && action === undefined && (
        <Text variant="meta" tone={tone === 'onStage' ? 'onStageMuted' : 'text2'} align="right">
          {meta}
        </Text>
      )}
      {action !== undefined && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  row: {
    minHeight: rowHeights.screenHeader,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.smd,
    paddingTop: spacing.smd,
    // Room between the title and the first block (readouts, a photo, a section heading).
    marginBottom: spacing.smd,
  },
  title: { flex: 1, minWidth: 0 },
  // A 44 px action (a close button) hangs into the right margin like the mockup's 4 px inset.
  action: { alignSelf: 'center', marginEnd: -spacing.smd },
}));
