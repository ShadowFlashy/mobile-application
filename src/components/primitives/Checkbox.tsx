import { Pressable, View } from 'react-native';
import { borders, createThemedStyles, spacing, touchTarget, useTheme } from '../../theme';
import { Icon } from './Icon';
import { Text } from './Text';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

export function Checkbox({ label, checked, onChange, disabled = false, testID }: CheckboxProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      style={[styles.container, disabled && styles.disabled]}
      testID={testID}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Icon name="checkmark" size={16} color={colors.onPrimary} />}
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
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: borders.strong,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // A ticked box is green with a check mark: "done", and not a second red next to the main action.
  boxChecked: { backgroundColor: colors.successFill, borderColor: colors.successFill },
  label: { flex: 1 },
  disabled: { opacity: 0.5 },
}));
