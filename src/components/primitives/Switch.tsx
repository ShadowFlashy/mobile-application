import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { createThemedStyles, easings, spacing, touchTarget, useMotion } from '../../theme';
import { Text } from './Text';

interface SwitchProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
  testID?: string;
}

const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 28;
const KNOB = 22;
const TRAVEL = TRACK_WIDTH - KNOB - 6;

/** A settings row with a label, an optional description and an on/off switch (48 dp). */
export function Switch({ label, value, onChange, description, disabled = false, testID }: SwitchProps) {
  const styles = useStyles();
  const { duration, nativeDriver } = useMotion();
  const position = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(position, {
      toValue: value ? 1 : 0,
      duration: duration('fast'),
      easing: easings.standard,
      useNativeDriver: nativeDriver,
    }).start();
  }, [value, position, duration, nativeDriver]);

  const translateX = position.interpolate({ inputRange: [0, 1], outputRange: [0, TRAVEL] });

  return (
    <Pressable
      onPress={() => onChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value, disabled }}
      aria-checked={value}
      style={[styles.row, disabled && styles.disabled]}
      testID={testID}
    >
      <View style={styles.text}>
        <Text variant="bodyStrong">{label}</Text>
        {description !== undefined && (
          <Text variant="bodySm" tone="muted">
            {description}
          </Text>
        )}
      </View>
      <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
      </View>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors, elevation, radii }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: touchTarget,
    paddingVertical: spacing.xs,
  },
  text: { flex: 1, gap: spacing.xxs },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: radii.pill,
    padding: 3,
    borderWidth: 0,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: colors.successFill },
  trackOff: { backgroundColor: colors.borderStrong },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: radii.pill,
    backgroundColor: colors.onPrimary,
    ...elevation.raised,
  },
  disabled: { opacity: 0.5 },
}));
