import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { createThemedStyles, lines, rowHeights, spacing, touchTarget } from '../../theme';
import type { Provenance } from '../../types/Identification';
import { Text } from '../primitives/Text';
import { ProvenanceTag } from './ProvenanceTag';

export interface DetailRowProps {
  /** Already translated: "Date", "City", "Paint". */
  label: string;
  /** The value on the right; `placeholder` styling when empty. */
  value: string;
  /** Shown in text-2 when `value` is empty ("Pick a city"). */
  placeholder?: string;
  /** Where the value came from, as a plain meta line under the label ("From photo", "Auto-fill", "You"). */
  provenance?: Provenance;
  /** An element before the value (e.g. a paint dot). */
  leading?: ReactNode;
  onPress: () => void;
  /** Spoken label of the whole row ("City: Leuven"). */
  accessibilityLabel: string;
  testID?: string;
}

/**
 * A's detail row of the New spot review: the label (value / text-2) with its provenance as meta
 * under it, and the value (body / text) on the right. The whole row opens an editor.
 */
export function DetailRow({
  label,
  value,
  placeholder,
  provenance,
  leading,
  onPress,
  accessibilityLabel,
  testID,
}: DetailRowProps) {
  const styles = useStyles();
  const isEmpty = value.length === 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.row, provenance !== undefined && styles.tall, pressed && styles.pressed]}
      testID={testID}
    >
      <View style={styles.label}>
        <Text variant="value" tone="text2" numberOfLines={1}>
          {label}
        </Text>
        {provenance !== undefined && <ProvenanceTag provenance={provenance} />}
      </View>
      <View style={styles.value}>
        {leading}
        <Text
          variant="body"
          tone={isEmpty ? 'text2' : 'text'}
          align="right"
          numberOfLines={2}
          testID={testID !== undefined ? `${testID}-value` : undefined}
        >
          {isEmpty ? (placeholder ?? '') : value}
        </Text>
      </View>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.xs,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  tall: { minHeight: rowHeights.tall },
  pressed: { backgroundColor: colors.raise },
  label: { flexShrink: 0, minWidth: 0 },
  value: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
}));
