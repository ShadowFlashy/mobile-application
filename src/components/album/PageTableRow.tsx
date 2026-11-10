import { Pressable, View } from 'react-native';
import { columns, createThemedStyles, lines, rowHeights, spacing } from '../../theme';
import { ProgressBar } from '../primitives/ProgressBar';
import { Text } from '../primitives/Text';

export interface PageTableRowProps {
  /** "01" … "09"; a set's number the same way. */
  number: string;
  /** Already translated page or set title. */
  title: string;
  /** The count in num ("2/17", or "1" on the Wildcards row). */
  count: string;
  /** 0..1; undefined = no progress line (the Wildcards row). */
  progress?: number;
  /** Spoken row label, e.g. "Page 2, Sports: 2 of 17 collected". */
  accessibilityLabel: string;
  onPress: () => void;
  /** The count carries `testID-count`. */
  testID?: string;
}

/** Width of the short progress line in a table row. */
export const TABLE_BAR_WIDTH = columns.tableBar;

/**
 * A row of the album index table: number (text-2), the name, a short 2 px progress line and the
 * count, on a 44 px hairline row. The whole row is one button.
 */
export function PageTableRow({
  number,
  title,
  count,
  progress,
  accessibilityLabel,
  onPress,
  testID,
}: PageTableRowProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID={testID}
    >
      <View style={styles.number}>
        <Text variant="numS" tone="text2">
          {number}
        </Text>
      </View>
      <View style={styles.title}>
        <Text variant="body" numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.bar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {progress !== undefined && (
          <ProgressBar progress={progress} label={accessibilityLabel} width={TABLE_BAR_WIDTH} />
        )}
      </View>
      <View style={styles.count}>
        <Text variant="num" align="right" testID={testID !== undefined ? `${testID}-count` : undefined}>
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    minHeight: rowHeights.default,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  pressed: { backgroundColor: colors.raise },
  number: { minWidth: columns.page, flexShrink: 0 },
  title: { flex: 1, minWidth: 0 },
  bar: { width: TABLE_BAR_WIDTH, flexShrink: 0 },
  count: { minWidth: columns.count, flexShrink: 0, alignItems: 'flex-end' },
}));
