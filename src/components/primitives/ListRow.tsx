import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { createThemedStyles, lines, rowHeights, spacing, touchTarget } from '../../theme';
import { Icon } from './Icon';
import { Text } from './Text';

/** Row pitch: 40 (compact, e.g. challenges), 44 (default) or 56 (tall, two lines). */
export type RowPitch = 'compact' | 'default' | 'tall';

export interface ListRowProps {
  /** Already translated. */
  title: string;
  /** A second line in meta / text-2 under the title. */
  subtitle?: string;
  /** Element before the text: a number column, a thumbnail, a radio, an icon. */
  leading?: ReactNode;
  /** A trailing value (e.g. "10 Nov 2026, 14:32"); text colour. */
  value?: string;
  /** A trailing element (a roundel, a count, a switch, a text action). Rendered after `value`. */
  trailing?: ReactNode;
  /** A chevron at the end (navigation rows). */
  chevron?: boolean;
  /** Makes the whole row pressable, with at least a 44 px target. */
  onPress?: () => void;
  /** Default `tall` with a subtitle, `default` without. */
  pitch?: RowPitch;
  /**
   * `default`: the title in body/text. `detail`: a label/value row (Date … 10 Nov), the title in
   * value/text-2 and the value in body/text. `primary`: the title in bodyL (the car name).
   */
  kind?: 'default' | 'detail' | 'primary';
  /** Finished items recede: the title turns text-2. */
  muted?: boolean;
  /** The bottom hairline. Default true. */
  divider?: boolean;
  /** Default `button` when pressable. */
  accessibilityRole?: 'button' | 'link';
  /** Spoken label; default the title, subtitle and value joined. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  testID?: string;
}

const PITCH: Record<RowPitch, number> = {
  compact: rowHeights.compact,
  default: rowHeights.default,
  tall: rowHeights.tall,
};

/**
 * A's hairline list row: optional leading element, title and subtitle, a trailing value or element,
 * an optional chevron, and a bottom hairline. Rows replace cards everywhere in direction A.
 */
export function ListRow({
  title,
  subtitle,
  leading,
  value,
  trailing,
  chevron = false,
  onPress,
  pitch,
  kind = 'default',
  muted = false,
  divider = true,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  testID,
}: ListRowProps) {
  const styles = useStyles();
  const height = PITCH[pitch ?? (subtitle !== undefined ? 'tall' : 'default')];
  const minHeight = onPress !== undefined ? Math.max(height, touchTarget) : height;
  const titleVariant = kind === 'primary' ? 'bodyL' : kind === 'detail' ? 'value' : 'body';
  const titleTone = muted || kind === 'detail' ? 'text2' : 'text';

  const content = (
    <>
      {leading !== undefined && <View style={styles.leading}>{leading}</View>}
      <View style={styles.text}>
        <Text variant={titleVariant} tone={titleTone} numberOfLines={kind === 'detail' ? 1 : 2}>
          {title}
        </Text>
        {subtitle !== undefined && (
          <Text variant="meta" tone="text2" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {value !== undefined && (
        <View style={styles.value}>
          <Text variant="body" tone={muted ? 'text2' : 'text'} align="right" numberOfLines={2}>
            {value}
          </Text>
        </View>
      )}
      {trailing !== undefined && <View style={styles.trailing}>{trailing}</View>}
      {chevron && <Icon name="chevron-right" size={20} tone="text2" />}
    </>
  );

  if (onPress === undefined) {
    return (
      <View style={[styles.row, { minHeight }, divider && styles.divider]} testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? [title, subtitle, value].filter(Boolean).join(', ')}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.row,
        { minHeight },
        divider && styles.divider,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      testID={testID}
    >
      {content}
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.xs,
  },
  divider: { borderBottomWidth: lines.hairline, borderBottomColor: colors.line },
  pressed: { backgroundColor: colors.raise },
  disabled: { opacity: 0.5 },
  leading: { flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, minWidth: 0 },
  value: { flexShrink: 1, maxWidth: '60%', alignItems: 'flex-end' },
  trailing: { flexShrink: 0, alignItems: 'flex-end', justifyContent: 'center' },
}));
