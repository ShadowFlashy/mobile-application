import { View } from 'react-native';
import { createThemedStyles, radii, spacing, useTheme } from '../../theme';
import { Text } from './Text';

interface ToastProps {
  message: string;
  variant?: 'default' | 'success' | 'error';
  visible: boolean;
  /** Distance from the bottom, e.g. to stay above a tab bar. */
  bottomOffset?: number;
  testID?: string;
}

export function Toast({ message, variant = 'default', visible, bottomOffset = spacing.lg, testID }: ToastProps) {
  const { colors } = useTheme();
  const styles = useStyles();

  if (!visible) return null;

  return (
    <View
      style={[styles.base, styles[variant], { bottom: bottomOffset }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      <Text size="md" weight="medium" color={variant === 'default' ? colors.onInverse : colors.onPrimary}>
        {message}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: {
    position: 'absolute',
    start: spacing.md,
    end: spacing.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    // Soft shadow (iOS / web) and elevation (Android); the theme has no shadow token, so it uses
    // the overlay colour: the dark, translucent scrim colour of both schemes.
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  default: { backgroundColor: colors.inverseSurface },
  success: { backgroundColor: colors.successFill },
  error: { backgroundColor: colors.dangerFill },
}));
