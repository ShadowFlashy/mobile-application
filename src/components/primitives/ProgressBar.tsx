import { View } from 'react-native';
import { createThemedStyles, useTheme } from '../../theme';

export type ProgressTone = 'primary' | 'success' | 'livery';

interface ProgressBarProps {
  /** Progress between 0 and 1. Values outside that range are clamped. */
  progress: number;
  label: string;
  /** Default `primary`. `livery` fills with `liveryColor` (an album page's livery). */
  tone?: ProgressTone;
  /** For components only: the livery colour for tone `livery`. */
  liveryColor?: string;
  /** @deprecated For components only; use `tone`. */
  color?: string;
  height?: number;
  testID?: string;
}

export function ProgressBar({
  progress,
  label,
  tone = 'primary',
  liveryColor,
  color,
  height = 10,
  testID,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const clamped = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const percentage = Math.round(clamped * 100);
  const toneColor =
    tone === 'success' ? colors.successFill : tone === 'livery' ? (liveryColor ?? colors.primary) : colors.primary;

  return (
    <View
      style={[styles.track, { height }]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      // aria-* props: read by TalkBack and rendered as real ARIA attributes on the web (PWA).
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      testID={testID}
    >
      <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: color ?? toneColor }]} />
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  track: {
    width: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.pill },
}));
