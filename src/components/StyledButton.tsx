import { View } from 'react-native';
import { createThemedStyles, spacing, touchTarget, useTheme, type ThemeColors } from '../theme';
import { Icon, type IconName } from './primitives/Icon';
import { PressableScale } from './primitives/PressableScale';
import { Spinner } from './primitives/Spinner';
import { Text } from './primitives/Text';

/**
 * - `primary`: the red fill with a white label (the one primary action of a screen).
 * - `secondary`: a `raise` fill with a text label.
 * - `text`: no fill, a 44 px text action ("See all", "Change").
 * - `destructive`: the red fill, only inside a ConfirmDialog.
 * Deprecated LIVERY names: `ghost` → text, `danger` → destructive, `ignition` → primary.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'destructive' | 'ghost' | 'danger' | 'ignition';

type ResolvedVariant = 'primary' | 'secondary' | 'text' | 'destructive';

const RESOLVED: Record<ButtonVariant, ResolvedVariant> = {
  primary: 'primary',
  secondary: 'secondary',
  text: 'text',
  destructive: 'destructive',
  ghost: 'text',
  danger: 'destructive',
  ignition: 'primary',
};

interface StyledButtonProps {
  /** Already translated, in sentence case ("Add to album"). */
  label: string;
  onPress: () => void;
  /** Default `primary`. */
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  /** An icon before the label (20 px). Use sparingly; most A buttons are label-only. */
  icon?: IconName;
  accessibilityHint?: string;
  testID?: string;
}

/** Label, icon and spinner colour per variant. */
const LABEL_TOKENS: Record<ResolvedVariant, keyof ThemeColors> = {
  primary: 'onRed',
  secondary: 'text',
  text: 'text',
  destructive: 'onRed',
};

/**
 * The app's button: Barlow 600 17/24 in sentence case, 52 px high with radius 8 (filled variants) or
 * a compact 44 px text action. Disabled filled buttons turn `raise` with a text-2 label.
 */
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
  const resolved = RESOLVED[variant];
  const isDisabled = disabled || isLoading;
  const isText = resolved === 'text';
  const labelColor = disabled ? colors.text2 : colors[LABEL_TOKENS[resolved]];
  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      dim={false}
      scaleTo={0.97}
      haptic={resolved === 'primary' ? 'tap' : undefined}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      busy={isLoading}
      testID={testID}
    >
      {({ pressed }) => (
        <View
          style={[
            isText ? styles.textBase : styles.base,
            styles[resolved],
            // The red fill darkens while pressed (redPressed) instead of fading.
            pressed && !isDisabled && (resolved === 'primary' || resolved === 'destructive') && styles.redPressed,
            disabled && !isText && styles.disabled,
          ]}
        >
          {isLoading ? (
            <Spinner size="small" color={labelColor} />
          ) : (
            <View style={styles.content}>
              {icon !== undefined && <Icon name={icon} size={20} color={labelColor} />}
              <Text variant="button" color={labelColor} numberOfLines={1}>
                {label}
              </Text>
            </View>
          )}
        </View>
      )}
    </PressableScale>
  );
}

const BUTTON_HEIGHT = 52;

const useStyles = createThemedStyles(({ colors, radii }) => ({
  base: {
    minHeight: BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  textBase: {
    minHeight: touchTarget,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  primary: { backgroundColor: colors.red },
  secondary: { backgroundColor: colors.raise },
  text: { backgroundColor: 'transparent' },
  destructive: { backgroundColor: colors.red },
  redPressed: { backgroundColor: colors.redPressed },
  disabled: { backgroundColor: colors.raise },
}));
