import { useEffect, useId, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { createThemedStyles, easings, lines, rowHeights, spacing, touchTarget, useMotion } from '../../theme';
import { spaceKey } from './keyboard';
import { Text } from './Text';

interface SwitchProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
  /** The bottom hairline of the row. Default false. */
  divider?: boolean;
  testID?: string;
}

/** iOS-like track: 51 × 31 with a 27 px thumb, inside a 44 px hit area. */
const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const INSET = 2;
const THUMB = TRACK_HEIGHT - INSET * 2;
const TRAVEL = TRACK_WIDTH - THUMB - INSET * 2;

/**
 * A settings row with a label, an optional description and an iOS-like switch. Off: a `line`
 * track with a text-2 thumb. On: a text-colour track with a bg-colour thumb. The whole row is the
 * hit area (at least 44 px, 56 with a description); the thumb slides unless motion is reduced.
 */
export function Switch({
  label,
  value,
  onChange,
  description,
  disabled = false,
  divider = false,
  testID,
}: SwitchProps) {
  const styles = useStyles();
  const { duration, nativeDriver } = useMotion();
  const position = useRef(new Animated.Value(value ? 1 : 0)).current;
  // Web drops accessibilityHint, so the description is tied to the switch with aria-describedby.
  const descriptionId = useId();

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
      {...spaceKey(() => onChange(!value), disabled)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      aria-describedby={description !== undefined ? descriptionId : undefined}
      accessibilityState={{ checked: value, disabled }}
      aria-checked={value}
      style={[styles.row, description !== undefined && styles.tall, divider && styles.divider]}
      testID={testID}
    >
      <View style={styles.text}>
        {/* Disabled dims the label and the track only: the description says how to enable it. */}
        <Text variant="body" tone={disabled ? 'text2' : 'text'}>
          {label}
        </Text>
        {description !== undefined && (
          <Text variant="meta" tone="text2" nativeID={descriptionId}>
            {description}
          </Text>
        )}
      </View>
      <View style={styles.hit}>
        <View style={[styles.track, value ? styles.trackOn : styles.trackOff, disabled && styles.disabled]}>
          <Animated.View
            style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff, { transform: [{ translateX }] }]}
          />
        </View>
      </View>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    minHeight: touchTarget,
    paddingVertical: spacing.xs,
  },
  tall: { minHeight: rowHeights.tall, paddingVertical: spacing.sm },
  divider: { borderBottomWidth: lines.hairline, borderBottomColor: colors.line },
  text: { flex: 1, minWidth: 0 },
  hit: { width: TRACK_WIDTH, height: touchTarget, justifyContent: 'center' },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: radii.pill,
    padding: INSET,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: colors.inverse },
  trackOff: { backgroundColor: colors.line },
  thumb: { width: THUMB, height: THUMB, borderRadius: radii.pill },
  thumbOn: { backgroundColor: colors.onInverse },
  thumbOff: { backgroundColor: colors.text2 },
  disabled: { opacity: 0.5 },
}));
