import { Pressable, View } from 'react-native';
import { createThemedStyles, spacing, touchTarget, useTheme, type ThemeColors } from '../../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export interface ToastAction {
  /** Already translated, e.g. "Reload". */
  label: string;
  onPress: () => void;
}

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  action?: ToastAction;
  /** Distance from the bottom, e.g. to stay above a tab bar. */
  bottomOffset?: number;
  testID?: string;
}

const INK: Record<ToastVariant, keyof ThemeColors> = {
  default: 'onInverse',
  success: 'onPrimary',
  error: 'onPrimary',
  warning: 'onSignal',
};

/** An icon per variant, so the meaning never depends on colour alone. */
const ICONS: Partial<Record<ToastVariant, IconName>> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  warning: 'warning',
};

export function Toast({
  message,
  variant = 'default',
  visible,
  action,
  bottomOffset = spacing.lg,
  testID,
}: ToastProps) {
  const { colors } = useTheme();
  const styles = useStyles();

  if (!visible) return null;
  const ink = colors[INK[variant]];
  const icon = ICONS[variant];

  return (
    <View
      style={[styles.base, styles[variant], { bottom: bottomOffset }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      {icon !== undefined && <Icon name={icon} size={20} color={ink} />}
      <View style={styles.message}>
        <Text variant="bodyStrong" color={ink}>
          {message}
        </Text>
      </View>
      {action !== undefined && (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          testID={testID !== undefined ? `${testID}-action` : undefined}
        >
          <Text variant="label" color={ink}>
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, elevation, radii }) => ({
  base: {
    position: 'absolute',
    start: spacing.md,
    end: spacing.md,
    maxWidth: 560,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.smd,
    paddingStart: spacing.md,
    paddingEnd: spacing.sm,
    borderRadius: radii.md,
    ...elevation.floating,
  },
  message: { flex: 1, paddingEnd: spacing.sm },
  default: { backgroundColor: colors.inverseSurface },
  success: { backgroundColor: colors.successFill },
  error: { backgroundColor: colors.dangerFill },
  warning: { backgroundColor: colors.signal },
  action: {
    minHeight: touchTarget,
    minWidth: touchTarget,
    paddingHorizontal: spacing.smd,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  pressed: { opacity: 0.7 },
}));
