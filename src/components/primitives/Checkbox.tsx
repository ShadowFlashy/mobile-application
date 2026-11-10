import { Pressable, View } from 'react-native';
import { createThemedStyles, lines, spacing, touchTarget } from '../../theme';
import { Icon } from './Icon';
import { spaceKey } from './keyboard';
import { Text } from './Text';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

const BOX = 20;

/** A 20 px box (text-2 ring; checked: a text-colour fill with a bg-colour check) and its label. */
export function Checkbox({ label, checked, onChange, disabled = false, testID }: CheckboxProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      {...spaceKey(() => onChange(!checked), disabled)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      aria-checked={checked}
      accessibilityLabel={label}
      style={[styles.container, disabled && styles.disabled]}
      testID={testID}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Icon name="check" size={16} tone="inverse" />}
      </View>
      <View style={styles.label}>
        <Text variant="body">{label}</Text>
      </View>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    minHeight: touchTarget,
  },
  box: {
    width: BOX,
    height: BOX,
    borderRadius: radii.sm,
    borderWidth: lines.ring,
    borderColor: colors.text2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.inverse, borderColor: colors.inverse },
  label: { flex: 1 },
  disabled: { opacity: 0.5 },
}));
