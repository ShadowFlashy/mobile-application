import { View } from 'react-native';
import { createThemedStyles, lines } from '../../theme';

interface ProgressBarProps {
  /** Progress between 0 and 1. Values outside that range are clamped. */
  progress: number;
  /** Spoken name of the bar, e.g. "Season 1". */
  label: string;
  /** Fixed width in dp (e.g. 96 in a page-table row). Default: the full width of the parent. */
  width?: number;
  testID?: string;
}

/** A's progress: a precise 2 px line, the `text` fill on a `line` track, with progressbar semantics. */
export function ProgressBar({ progress, label, width, testID }: ProgressBarProps) {
  const styles = useStyles();
  const clamped = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const percentage = Math.round(clamped * 100);

  return (
    <View
      style={[styles.track, width !== undefined && { width }]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      // aria-* props: read by TalkBack and rendered as real ARIA attributes on the web (PWA).
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      testID={testID}
    >
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  track: {
    width: '100%',
    height: lines.progress,
    backgroundColor: colors.line,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.text },
}));
