import { View, Pressable } from 'react-native';
import { createThemedStyles, radii } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  /** Read by screen readers when the card is pressable. */
  accessibilityLabel?: string;
  variant?: 'default' | 'muted' | 'highlight';
  testID?: string;
}

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

const useStyles = createThemedStyles(({ colors }) => ({
  base: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    // Soft shadow (iOS / web) and elevation (Android). The theme has no shadow token, so it uses
    // the overlay colour: the dark, translucent scrim colour of both schemes.
    shadowColor: colors.overlay,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  default: { backgroundColor: colors.surface },
  muted: { backgroundColor: colors.surfaceMuted, shadowOpacity: 0, elevation: 0 },
  highlight: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
}));
