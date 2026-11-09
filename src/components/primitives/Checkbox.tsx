import { Pressable, View } from 'react-native';
import { createThemedStyles, radii, spacing, touchTarget, useTheme } from '../../theme';
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
        <Text size="md">{label}</Text>
      </View>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { flex: 1 },
  disabled: { opacity: 0.5 },
}));
