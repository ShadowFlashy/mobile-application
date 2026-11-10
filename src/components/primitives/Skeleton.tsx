import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, radii, useMotion } from '../../theme';

/**
 * Named placeholder heights, so screens never pass pixel sizes (golden rule 2: no styling in app/**).
 * line: a text line · header: a title row · row: a list row · plaque: an achievement row ·
 * board: a challenge block · card: a car row block · panel: a car header · photo: a photo.
 */
export const SKELETON_PRESETS = {
  line: 16,
  header: 44,
  row: 56,
  plaque: 56,
  board: 120,
  card: 140,
  panel: 160,
  photo: 220,
} as const;
export type SkeletonPreset = keyof typeof SKELETON_PRESETS;

interface SkeletonProps {
  width?: number | `${number}%`;
  /** Pixel height, for components. Screens use `preset`. */
  height?: number;
  /** A named height from SKELETON_PRESETS; wins over `height`. */
  preset?: SkeletonPreset;
  /** `rect` (default, radius 4), `photo` (radius 8), `circle`. `sticker` is the deprecated name of `photo`. */
  shape?: 'rect' | 'photo' | 'sticker' | 'circle';
  /** @deprecated Use `shape`. */
  borderRadius?: number;
  testID?: string;
}

const SHAPE_RADII = { rect: radii.sm, photo: radii.md, sticker: radii.md, circle: radii.pill } as const;

/** A flat `raise` block that pulses gently while content loads (static when motion is reduced). */
export function Skeleton({
  width = '100%',
  height = SKELETON_PRESETS.line,
  preset,
  shape = 'rect',
  borderRadius,
  testID,
}: SkeletonProps) {
  const resolvedHeight = preset !== undefined ? SKELETON_PRESETS[preset] : height;
  const { t } = useTranslation();
  const styles = useStyles();
  const { reduced, nativeDriver } = useMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      return undefined;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.55, duration: 900, useNativeDriver: nativeDriver }),
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: nativeDriver }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, reduced, nativeDriver]);

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height: resolvedHeight, borderRadius: borderRadius ?? SHAPE_RADII[shape], opacity },
      ]}
      accessibilityLabel={t('a11y.loading')}
      testID={testID}
    />
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: { backgroundColor: colors.raise },
}));
