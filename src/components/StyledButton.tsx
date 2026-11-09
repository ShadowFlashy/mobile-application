import { Pressable, View } from 'react-native';
import { createThemedStyles, radii, spacing, touchTarget, useTheme, type ThemeColors } from '../theme';
import { Icon, type IconName } from './primitives/Icon';
import { Spinner } from './primitives/Spinner';
import { Text } from './primitives/Text';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface StyledButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  accessibilityHint?: string;
  testID?: string;
}

/** Label, icon and spinner colour per variant. */
const labelTokens: Record<ButtonVariant, keyof ThemeColors> = {
  primary: 'onPrimary',
  secondary: 'accent',
  danger: 'onPrimary',
  ghost: 'accent',
};

export function StyledButton({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  icon,
  accessibilityHint,
  testID,
}: StyledButtonProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const isDisabled = disabled || isLoading;
  const labelColor = colors[labelTokens[variant]];
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && (variant === 'primary' ? styles.primaryPressed : styles.pressed),
        isDisabled && styles.disabled,
      ]}
      testID={testID}
    >
      {isLoading ? (
        <Spinner size="small" color={labelColor} />
      ) : (
        <View style={styles.content}>
          {icon !== undefined && <Icon name={icon} size={20} color={labelColor} />}
          <Text weight="bold" size="lg" color={labelColor}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: {
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderColor: colors.primary },
  danger: { backgroundColor: colors.dangerFill },
  ghost: { backgroundColor: 'transparent' },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
}));
