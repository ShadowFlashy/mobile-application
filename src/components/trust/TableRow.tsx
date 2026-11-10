import type { ReactNode } from 'react';
import { View } from 'react-native';
import { createThemedStyles, lines, rowHeights, spacing } from '../../theme';
import { Text } from '../primitives/Text';

export interface TableRowProps {
  /** Already translated row label. */
  label: string;
  /** A text-2 line under the label ("Never stored"). Makes the row 56 high. */
  hint?: string;
  /** The right-hand cell: a figure, a status. */
  value: ReactNode;
  /** One spoken label for the whole row; without it the cells are read one by one. */
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * One row of a hairline data table (Privacy and auto-fill): the label (with an optional text-2 hint) on the
 * left, the value on the right, a 1 px hairline under it. 44 high, 56 with a hint. No boxes.
 */
export function TableRow({ label, hint, value, accessibilityLabel, testID }: TableRowProps) {
  const styles = useStyles();
  const grouped = accessibilityLabel !== undefined;
  return (
    <View
      style={[styles.row, hint !== undefined && styles.tall]}
      accessible={grouped}
      accessibilityRole={grouped ? 'text' : undefined}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <View style={styles.label}>
        <Text variant="body">{label}</Text>
        {hint !== undefined && (
          <Text variant="meta" tone="text2">
            {hint}
          </Text>
        )}
      </View>
      <View style={styles.value}>{value}</View>
    </View>
  );
}

export interface TableHeaderProps {
  /** Already translated column names, left and right. */
  left: string;
  right: string;
  testID?: string;
}

/** The column names of a hairline table, in meta / text-2 on a 36 px row. Hidden from screen readers. */
export function TableHeader({ left, right, testID }: TableHeaderProps) {
  const styles = useStyles();
  return (
    <View
      style={[styles.row, styles.header]}
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      testID={testID}
    >
      <View style={styles.label}>
        <Text variant="meta" tone="text2" decorative>
          {left}
        </Text>
      </View>
      <Text variant="meta" tone="text2" align="right" decorative>
        {right}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    minHeight: rowHeights.default,
    paddingVertical: spacing.xs,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  tall: { minHeight: rowHeights.tall },
  header: { minHeight: rowHeights.sectionHeading },
  label: { flex: 1, minWidth: 0 },
  value: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
}));
