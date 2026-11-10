import { Pressable, View } from 'react-native';
import { createThemedStyles, lines, rowHeights, spacing, touchTarget } from '../../theme';
import { spaceKey } from '../primitives/keyboard';
import { Text } from '../primitives/Text';

export interface RowOption<T extends string> {
  value: T;
  /** Short visible label, e.g. "EN". */
  label: string;
  /** Spoken name, e.g. "English". */
  accessibilityLabel: string;
}

export interface OptionRowProps<T extends string> {
  /** Already translated row label, also the radio group's name ("Language"). */
  label: string;
  options: readonly RowOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Each option gets `<testID>-<value>`. */
  testID?: string;
}

/**
 * A settings row with a choice (Profile → Language): the label on the left, short text tabs on the
 * right. The selected option is text colour with a 2 px underline, the others text-2; each is a
 * 44 × 44 radio. A hairline closes the row.
 */
export function OptionRow<T extends string>({ label, options, value, onChange, testID }: OptionRowProps<T>) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <View style={styles.label}>
        <Text variant="body" decorative>
          {label}
        </Text>
      </View>
      <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel={label} testID={testID}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              {...spaceKey(() => onChange(option.value))}
              accessibilityRole="radio"
              accessibilityLabel={option.accessibilityLabel}
              accessibilityState={{ checked: selected }}
              aria-checked={selected}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              testID={testID !== undefined ? `${testID}-${option.value}` : undefined}
            >
              <View style={[styles.mark, selected && styles.markSelected]}>
                <Text variant="heading" tone={selected ? 'text' : 'text2'} decorative>
                  {option.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    minHeight: rowHeights.default,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  label: { flex: 1, minWidth: 0 },
  options: { flexDirection: 'row', gap: spacing.xs },
  option: { minWidth: touchTarget, minHeight: touchTarget, alignItems: 'center', justifyContent: 'center' },
  mark: { borderBottomWidth: lines.underline, borderBottomColor: 'transparent' },
  markSelected: { borderBottomColor: colors.text },
  pressed: { opacity: 0.6 },
}));
