import type { ReactNode } from 'react';
import { View, Pressable } from 'react-native';
import { createThemedStyles } from '../../theme';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  /** Read by screen readers when the card is pressable. */
  accessibilityLabel?: string;
  variant?: 'default' | 'muted' | 'highlight';
  testID?: string;
}

/** v1 card, restyled with LIVERY tokens. New code uses `Surface`. */
export function Card({ children, onPress, accessibilityLabel, variant = 'default', testID }: CardProps) {
  const styles = useStyles();

  if (onPress !== undefined) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed]}
        testID={testID}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.base, styles[variant]]} testID={testID}>
      {children}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, elevation, radii }) => ({
  base: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...elevation.raised,
  },
  default: { backgroundColor: colors.surface },
  muted: { backgroundColor: colors.surfaceMuted, shadowOpacity: 0, elevation: 0 },
  highlight: { backgroundColor: colors.primarySoft, borderColor: colors.accent },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
}));
