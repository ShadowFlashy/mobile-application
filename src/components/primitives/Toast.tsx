import { Pressable, View } from 'react-native';
import { createThemedStyles, lines, spacing, touchTarget } from '../../theme';
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

/** An icon per variant: the state is text plus an icon, never a colour. */
const ICONS: Partial<Record<ToastVariant, IconName>> = {
  success: 'check-circle',
  error: 'alert',
  warning: 'warning',
};

/** A flat `raise` bar with a hairline border (radius 8): the icon, the message and a text action. */
export function Toast({
  message,
  variant = 'default',
  visible,
  action,
  bottomOffset = spacing.lg,
  testID,
}: ToastProps) {
  const styles = useStyles();

  if (!visible) return null;
  const icon = ICONS[variant];

  return (
    <View
      style={[styles.base, { bottom: bottomOffset }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      {icon !== undefined && <Icon name={icon} size={20} tone="text" />}
      <View style={styles.message}>
        <Text variant="body">{message}</Text>
      </View>
      {action !== undefined && (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          testID={testID !== undefined ? `${testID}-action` : undefined}
        >
          <Text variant="button">{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  base: {
    position: 'absolute',
    start: spacing.gutter,
    end: spacing.gutter,
    maxWidth: 560,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    minHeight: touchTarget + spacing.smd,
    paddingStart: spacing.md,
    paddingEnd: spacing.sm,
    borderRadius: radii.md,
    borderWidth: lines.hairline,
    // `field`: the edge of a panel floating over content must be visible (3:1).
    borderColor: colors.field,
    backgroundColor: colors.raise,
  },
  message: { flex: 1, paddingVertical: spacing.smd },
  action: {
    minHeight: touchTarget,
    minWidth: touchTarget,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
}));
