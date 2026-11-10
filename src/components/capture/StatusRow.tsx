import type { ReactNode } from 'react';
import { View } from 'react-native';
import { createThemedStyles, iconSizes, lines, rowHeights, spacing } from '../../theme';
import { Icon, type IconName } from '../primitives/Icon';
import { Spinner } from '../primitives/Spinner';
import { Text } from '../primitives/Text';

export interface StatusRowProps {
  /** A 20 px icon in the text colour; ignored while `busy`. */
  icon?: IconName;
  /** Shows a spinner instead of the icon. */
  busy?: boolean;
  /** Already translated, e.g. "Auto-fill is analysing…". */
  title: string;
  /** A second line in meta / text-2. */
  body?: string;
  /** testID of the title text (e.g. `ai-status-banner-quota`). */
  titleTestID?: string;
  /** Text actions after the text (e.g. "Fill in myself"), on the right or wrapped under it. */
  actions?: ReactNode;
  /** Announce changes politely (status) or not at all. Default true. */
  live?: boolean;
  testID?: string;
}

/**
 * A's plain status row for auto-fill and save states: an icon or spinner, the status in body text,
 * an optional meta line and text actions, with a bottom hairline. Never a chip, banner or colour.
 */
export function StatusRow({
  icon = 'info',
  busy = false,
  title,
  body,
  titleTestID,
  actions,
  live = true,
  testID,
}: StatusRowProps) {
  const styles = useStyles();
  return (
    <View
      style={[styles.row, body !== undefined && styles.tall]}
      accessibilityLiveRegion={live ? 'polite' : 'none'}
      testID={testID}
    >
      <View style={styles.leading}>{busy ? <Spinner size="small" /> : <Icon name={icon} size={20} />}</View>
      <View style={styles.text}>
        <Text variant="body" testID={titleTestID}>
          {title}
        </Text>
        {body !== undefined && (
          <Text variant="meta" tone="text2">
            {body}
          </Text>
        )}
      </View>
      {actions !== undefined && <View style={styles.actions}>{actions}</View>}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    minHeight: rowHeights.default,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacing.smd,
    paddingVertical: spacing.xs,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  tall: { minHeight: rowHeights.tall },
  leading: { width: iconSizes.md, alignItems: 'center' },
  text: { flex: 1, minWidth: '50%' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginStart: 'auto' },
}));
