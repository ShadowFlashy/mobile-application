import { useId } from 'react';
import { Pressable, View } from 'react-native';
import { createThemedStyles, lines, rowHeights, spacing, touchTarget } from '../../theme';
import { spaceKey } from './keyboard';
import { Text } from './Text';

interface RadioProps {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  /** A sub-line in meta / text-2, e.g. "Tap the box on the photo, or drag to draw one". */
  description?: string;
  /** The bottom hairline of the row. Default true (radio rows sit in a hairline list). */
  divider?: boolean;
  disabled?: boolean;
  testID?: string;
}

const CIRCLE = 20;
const DOT = 10;

/**
 * A's radio row: a 20 px ring (text-2, or text when selected, with a text-colour dot) and the label,
 * on a 44 px row (56 with a description) with a bottom hairline.
 */
export function Radio({
  label,
  value,
  selected,
  onSelect,
  description,
  divider = true,
  disabled = false,
  testID,
}: RadioProps) {
  const styles = useStyles();
  // Web drops accessibilityHint, so the description is tied to the radio with aria-describedby.
  const descriptionId = useId();
  return (
    <Pressable
      onPress={() => onSelect(value)}
      {...spaceKey(() => onSelect(value), disabled)}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      aria-checked={selected}
      accessibilityLabel={label}
      accessibilityHint={description}
      aria-describedby={description !== undefined ? descriptionId : undefined}
      style={({ pressed }) => [
        styles.row,
        description !== undefined && styles.tall,
        divider && styles.divider,
        pressed && styles.pressed,
      ]}
      testID={testID}
    >
      {/* Disabled dims the ring and the label only: the description says how to enable the row. */}
      <View style={[styles.circle, selected && styles.circleSelected, disabled && styles.disabled]}>
        {selected && <View style={styles.dot} />}
      </View>
      <View style={styles.text}>
        <Text variant="body" tone={disabled ? 'text2' : 'text'}>
          {label}
        </Text>
        {description !== undefined && (
          <Text variant="meta" tone="text2" nativeID={descriptionId}>
            {description}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    minHeight: touchTarget,
    paddingVertical: spacing.xs,
  },
  tall: { minHeight: rowHeights.tall, paddingVertical: spacing.sm },
  divider: { borderBottomWidth: lines.hairline, borderBottomColor: colors.line },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: radii.pill,
    borderWidth: lines.ring,
    borderColor: colors.text2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: { borderColor: colors.text },
  dot: { width: DOT, height: DOT, borderRadius: radii.pill, backgroundColor: colors.text },
  text: { flex: 1, minWidth: 0 },
}));
