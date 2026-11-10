import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { createThemedStyles, useMotion } from '../../theme';

export type ShiftLightsLeds = 5 | 15;

export interface ShiftLightsProps {
  /** 0–1 */
  ratio: number;
  leds: ShiftLightsLeds;
  /** Blink the lit LEDs a few times (level-up): 2.5 Hz, so below the 3 Hz flash limit. */
  blink?: boolean;
  /** Accessible label (e.g. the confidence or level progress in words). */
  label: string;
  testID?: string;
}

export type LedZone = 'green' | 'yellow' | 'red';

/** LEDs lit for a ratio: round(ratio × leds), clamped to 0…leds. */
export function litLeds(ratio: number, leds: number): number {
  const safe = Number.isFinite(ratio) ? Math.min(Math.max(ratio, 0), 1) : 0;
  return Math.round(safe * leds);
}

/** Colour zone of an LED: the first 40 % green, up to 80 % yellow, the rest red. */
export function ledZone(index: number, leds: number): LedZone {
  const position = (index + 1) / leds;
  if (position <= 0.4) return 'green';
  if (position <= 0.8) return 'yellow';
  return 'red';
}

/** Half a blink period in ms: 200 on + 200 off = 2.5 Hz (WCAG 2.3.1 allows at most 3 flashes/s). */
const BLINK_HALF_MS = 200;
const BLINK_TIMES = 6;

/**
 * A row of shift lights in a dark bezel: round(ratio × leds) LEDs lit, green → yellow → red.
 * Lit LEDs are full and bright, unlit ones are hollow, so the state never relies on colour alone,
 * and the value is exposed as a progress bar.
 */
export function ShiftLights({ ratio, leds, blink = false, label, testID }: ShiftLightsProps) {
  const styles = useStyles();
  const motion = useMotion();
  const opacity = useRef(new Animated.Value(1)).current;
  const lit = litLeds(ratio, leds);

  useEffect(() => {
    if (!blink || motion.reduced) {
      opacity.setValue(1);
      return undefined;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.15, duration: BLINK_HALF_MS, useNativeDriver: motion.nativeDriver }),
        Animated.timing(opacity, { toValue: 1, duration: BLINK_HALF_MS, useNativeDriver: motion.nativeDriver }),
      ]),
      { iterations: BLINK_TIMES },
    );
    animation.start();
    return () => {
      animation.stop();
      opacity.setValue(1);
    };
  }, [blink, motion.reduced, motion.nativeDriver, opacity]);

  const size = leds === 15 ? styles.ledLarge : styles.ledSmall;
  return (
    <View
      style={styles.bezel}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: leds, now: lit }}
      aria-valuemin={0}
      aria-valuemax={leds}
      aria-valuenow={lit}
      testID={testID}
    >
      {Array.from({ length: leds }, (_, index) => {
        const isLit = index < lit;
        const zone = ledZone(index, leds);
        return isLit ? (
          <Animated.View
            key={index}
            style={[styles.led, size, styles[zone], { opacity }]}
            testID={testID !== undefined ? `${testID}-led-on` : undefined}
          />
        ) : (
          <View
            key={index}
            style={[styles.led, size, styles.off]}
            testID={testID !== undefined ? `${testID}-led-off` : undefined}
          />
        );
      })}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, instruments, spacing, radii }) => ({
  // The strip never overflows its card: the bezel is capped at the parent's width and the LEDs
  // shrink (staying round through aspectRatio) when 15 of them do not fit, e.g. at 360 px.
  bezel: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: instruments.pitBoard,
  },
  led: { borderRadius: radii.pill, borderWidth: 2, flexShrink: 1, minWidth: 6, aspectRatio: 1 },
  ledSmall: { width: 10 },
  ledLarge: { width: 12 },
  green: { backgroundColor: instruments.ledGreen, borderColor: instruments.ledGreen },
  yellow: { backgroundColor: instruments.timingYellow, borderColor: instruments.timingYellow },
  red: { backgroundColor: instruments.ledRed, borderColor: instruments.ledRed },
  off: { backgroundColor: instruments.pitBoard, borderColor: colors.textSubtle },
}));
