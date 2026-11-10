import { Text as RNText, View } from 'react-native';
import {
  createThemedStyles,
  FONT_FAMILIES,
  fontFamily,
  spacing,
  touchTarget,
  useTheme,
  type ThemeColors,
} from '../theme';
import { Gradient } from './primitives/Gradient';
import { Icon, type IconName } from './primitives/Icon';
import { PressableScale } from './primitives/PressableScale';
import { Spinner } from './primitives/Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'ignition';

interface StyledButtonProps {
  label: string;
  onPress: () => void;
  /** Default `primary`. `ignition` is the big red gradient call to action (e.g. COLLECT). */
  variant?: ButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  accessibilityHint?: string;
  testID?: string;
}

/** Label, icon and spinner colour per variant. */
const LABEL_TOKENS: Record<ButtonVariant, keyof ThemeColors> = {
  primary: 'onPrimary',
  secondary: 'text',
  danger: 'onPrimary',
  ghost: 'accent',
  ignition: 'onPrimary',
};

/**
 * The app's button: a condensed uppercase label, a press scale and, in dark mode, a red glow on
 * the filled red variants.
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
  const isDisabled = disabled || isLoading;
  const labelColor = colors[LABEL_TOKENS[variant]];
  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      scaleTo={variant === 'ignition' ? 0.94 : 0.97}
      haptic={variant === 'ignition' ? 'tap' : undefined}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      busy={isLoading}
      testID={testID}
    >
      <View style={[styles.base, styles[variant]]}>
        {variant === 'ignition' && <Gradient colors={[colors.primary, colors.primaryPressed]} fill />}
        {isLoading ? (
          <Spinner size="small" color={labelColor} />
        ) : (
          <View style={styles.content}>
            {icon !== undefined && <Icon name={icon} size={variant === 'ignition' ? 24 : 20} color={labelColor} />}
            <RNText
              style={[styles.label, variant === 'ignition' && styles.labelIgnition, { color: labelColor }]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.4}
            >
              {label}
            </RNText>
          </View>
        )}
      </View>
    </PressableScale>
  );
}

const useStyles = createThemedStyles(({ colors, elevation, radii, scheme }) => {
  const glow =
    scheme === 'dark' ? { ...elevation.lifted, shadowColor: colors.primary, shadowOpacity: 0.45 } : elevation.raised;
  return {
    base: {
      minHeight: touchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: 'transparent',
      overflow: 'hidden',
    },
    content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    label: {
      fontFamily: fontFamily(FONT_FAMILIES.condensedBold),
      fontSize: 18,
      lineHeight: 22,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    labelIgnition: { fontFamily: fontFamily(FONT_FAMILIES.condensedExtraBoldItalic), fontSize: 22, lineHeight: 26 },
    primary: { backgroundColor: colors.primary, ...glow },
    secondary: { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderWidth: 2 },
    danger: { backgroundColor: colors.dangerFill },
    ghost: { backgroundColor: 'transparent' },
    ignition: { minHeight: 56, borderRadius: radii.lg, ...glow },
  };
});
