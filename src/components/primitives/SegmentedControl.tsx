import { Pressable, View } from 'react-native';
import { createThemedStyles, lines, spacing, touchTarget } from '../../theme';
import { spaceKey } from './keyboard';
import { Text } from './Text';

export interface SegmentOption<T extends string> {
  value: T;
  /** Already translated. */
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /**
   * `radio` (default): a choice of a setting (radiogroup / radio, aria-checked). `tab`: A's text tabs
   * that switch content, such as "Pages | Collections" (tablist / tab, aria-selected).
   */
  role?: 'radio' | 'tab';
  /** Spoken name of the group. */
  accessibilityLabel?: string;
  /** Each segment gets `<testID>-<value>`. */
  testID?: string;
}

/**
 * A's text tabs: labels in a row on a hairline; the active one is text colour with a 2 px underline,
 * the others are text-2. Each tab is a 44 px target.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  role = 'radio',
  accessibilityLabel,
  testID,
}: SegmentedControlProps<T>) {
  const styles = useStyles();
  const isTab = role === 'tab';
  return (
    <View
      style={styles.track}
      accessibilityRole={isTab ? 'tablist' : 'radiogroup'}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            {...spaceKey(() => onChange(option.value))}
            accessibilityRole={isTab ? 'tab' : 'radio'}
            accessibilityLabel={option.label}
            accessibilityState={isTab ? { selected } : { checked: selected }}
            aria-selected={isTab ? selected : undefined}
            aria-checked={isTab ? undefined : selected}
            style={({ pressed }) => [styles.segment, selected && styles.selected, pressed && styles.pressed]}
            testID={testID !== undefined ? `${testID}-${option.value}` : undefined}
          >
            <Text variant="heading" tone={selected ? 'text' : 'text2'} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  track: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.lg,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  segment: {
    minHeight: touchTarget,
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
    // The underline sits on the track's hairline.
    marginBottom: -lines.hairline,
    borderBottomWidth: lines.underline,
    borderBottomColor: 'transparent',
  },
  selected: { borderBottomColor: colors.text },
  pressed: { opacity: 0.6 },
}));
