import { View } from 'react-native';
import { createThemedStyles, radii, useTheme } from '../../theme';

interface ProgressBarProps {
  /** Progress between 0 and 1. Values outside that range are clamped. */
  progress: number;
  label: string;
  /** Fill colour; defaults to the theme's primary colour. */
  color?: string;
  height?: number;
  testID?: string;
}

export function ProgressBar({ progress, label, color, height = 10, testID }: ProgressBarProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const clamped = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const percentage = Math.round(clamped * 100);

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
      <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: color ?? colors.primary }]} />
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  track: {
    width: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.pill },
}));
