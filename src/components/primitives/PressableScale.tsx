import { useRef, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, type AccessibilityRole } from 'react-native';
import { useHaptics } from '../../hooks/useHaptics';
import { springs, useMotion } from '../../theme';
import type { HapticPattern } from '../../types/Settings';

export interface PressableScaleProps {
  children: ReactNode;
  onPress: () => void;
  /** How far the content shrinks while pressed. Default 0.97. */
  scaleTo?: 0.94 | 0.97;
  /** Haptic pattern played on press (respects the haptics setting). */
  haptic?: HapticPattern;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Selected state, e.g. for tabs and segments. */
  selected?: boolean;
  /** Checked state, for switches and radios. */
  checked?: boolean;
  /** Busy state, e.g. a button that is saving. */
  busy?: boolean;
  disabled?: boolean;
  /** Stretches to fill its parent (flex: 1). */
  fill?: boolean;
  testID?: string;
}

/** A pressable that springs down while pressed (no animation with reduced motion). */
export function PressableScale({
  children,
  onPress,
  scaleTo = 0.97,
  haptic,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
  selected,
  checked,
  busy,
  disabled = false,
  fill = false,
  testID,
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const { reduced, nativeDriver } = useMotion();
  const { play } = useHaptics();

  const animateTo = (toValue: number) => {
    if (reduced) {
      scale.setValue(1);
      return;
    }
    Animated.spring(scale, { toValue, ...springs.press, useNativeDriver: nativeDriver }).start();
  };

  return (
    <Pressable
      onPress={() => {
        if (haptic !== undefined) play(haptic);
        onPress();
      }}
      onPressIn={() => animateTo(scaleTo)}
      onPressOut={() => animateTo(1)}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, selected, checked, busy }}
      // react-native-web 0.19 only renders the aria-* props as attributes.
      aria-selected={selected}
      aria-checked={checked}
      aria-busy={busy}
      style={[fill && styles.fill, disabled && styles.disabled]}
      testID={testID}
    >
      <Animated.View style={[fill && styles.fill, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  disabled: { opacity: 0.5 },
});
