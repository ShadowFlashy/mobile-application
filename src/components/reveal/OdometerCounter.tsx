import { useEffect, useRef, useState } from 'react';
import { Animated, View, type LayoutChangeEvent } from 'react-native';
import { createThemedStyles, easings, useMotion } from '../../theme';
import { Text } from '../primitives/Text';

export interface OdometerCounterProps {
  value: number;
  /** Pads with leading zeros, like a real odometer (e.g. 4 → "0450"). */
  digits?: number;
  /** Shown after the number and read out with it, e.g. "XP". */
  suffix?: string;
  /** Rolls from this value to `value` on mount and whenever `value` changes. Without it, no roll. */
  animateFrom?: number;
  /** `onStage` on the always-dark reveal backdrop. Default `default`. */
  tone?: 'default' | 'onStage';
  /** `md` (numberSm type) or `lg` (number type, default). */
  size?: 'md' | 'lg';
  testID?: string;
}

function toDigits(value: number, digits: number): string {
  return String(value).padStart(digits, '0');
}

const DIGIT_GLYPHS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

interface DigitColumnProps {
  digit: number;
  cellHeight: number;
  variant: 'number' | 'numberSm';
  tone: 'default' | 'onStage';
  rollMs: number;
  nativeDriver: boolean;
}

/** One wheel of the odometer: a column of 0–9 that rolls to its digit. */
function DigitColumn({ digit, cellHeight, variant, tone, rollMs, nativeDriver }: DigitColumnProps) {
  const styles = useStyles();
  const offset = useRef(new Animated.Value(-digit * cellHeight)).current;

  useEffect(() => {
    const animation = Animated.timing(offset, {
      toValue: -digit * cellHeight,
      duration: rollMs,
      easing: easings.standard,
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [digit, cellHeight, offset, rollMs, nativeDriver]);

  return (
    <View style={[styles.cell, { height: cellHeight }]}>
      <View style={styles.sizer}>
        <Text variant={variant} tone={tone}>
          0
        </Text>
      </View>
      <Animated.View style={[styles.wheel, { transform: [{ translateY: offset }] }]}>
        {DIGIT_GLYPHS.map((glyph) => (
          <View key={glyph} style={{ height: cellHeight }}>
            <Text variant={variant} tone={tone} align="center">
              {glyph}
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

/**
 * Numbers that roll like an odometer (SPEC §7.10, §7.13). Each digit is a wheel; the value counts
 * from `animateFrom` to `value` over the `odometer` duration. With reduced motion, or without
 * `animateFrom`, the final value shows at once. The final value is always the accessible label, so a
 * screen reader never hears the digits spin.
 */
export function OdometerCounter({
  value,
  digits = 0,
  suffix,
  animateFrom,
  tone = 'default',
  size = 'lg',
  testID,
}: OdometerCounterProps) {
  const styles = useStyles();
  const { reduced, duration, nativeDriver } = useMotion();
  const final = Math.max(0, Math.round(Number.isFinite(value) ? value : 0));
  const from = Math.max(0, Math.round(animateFrom ?? final));
  const animate = !reduced && animateFrom !== undefined && from !== final;
  const variant = size === 'lg' ? 'number' : 'numberSm';
  const label = suffix !== undefined ? `${final} ${suffix}` : String(final);

  const [shown, setShown] = useState(animate ? from : final);
  const [cellHeight, setCellHeight] = useState<number>();
  const progress = useRef(new Animated.Value(animate ? from : final)).current;

  useEffect(() => {
    if (!animate) {
      progress.setValue(final);
      setShown(final);
      return undefined;
    }
    progress.setValue(from);
    setShown(from);
    const listener = progress.addListener(({ value: current }) => setShown(Math.round(current)));
    // The listener needs JS-side values, so this timing never uses the native driver.
    const animation = Animated.timing(progress, {
      toValue: final,
      duration: duration('odometer'),
      easing: easings.decelerate,
      useNativeDriver: false,
    });
    animation.start(() => setShown(final));
    return () => {
      animation.stop();
      progress.removeListener(listener);
    };
  }, [animate, final, from, progress, duration]);

  const width = Math.max(digits, String(Math.max(final, from)).length);
  const text = toDigits(animate ? shown : final, width);

  const onMeasure = (event: LayoutChangeEvent) => {
    const height = Math.ceil(event.nativeEvent.layout.height);
    if (height > 0 && height !== cellHeight) setCellHeight(height);
  };

  return (
    <View style={styles.row} accessible accessibilityRole="text" accessibilityLabel={label} testID={testID}>
      <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {!animate || cellHeight === undefined ? (
          <View onLayout={onMeasure}>
            <Text variant={variant} tone={tone}>
              {text}
            </Text>
          </View>
        ) : (
          text
            .split('')
            .map((glyph, index) => (
              <DigitColumn
                key={`${width - index}`}
                digit={Number(glyph)}
                cellHeight={cellHeight}
                variant={variant}
                tone={tone}
                rollMs={duration('fast')}
                nativeDriver={nativeDriver}
              />
            ))
        )}
        {suffix !== undefined && (
          <View style={styles.suffix}>
            <Text variant={size === 'lg' ? 'numberSm' : 'caption'} tone={tone}>
              {suffix}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ spacing }) => ({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  cell: { overflow: 'hidden' },
  sizer: { opacity: 0 },
  wheel: { position: 'absolute', top: 0, left: 0, right: 0 },
  suffix: { marginLeft: spacing.xs, paddingBottom: spacing.xxs },
}));
