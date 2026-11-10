import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import { ProgressBar } from './ProgressBar';
import { Text } from './Text';

interface ReadoutProps {
  /** The figure, already formatted ("10", "8", "2,140"). */
  value: string;
  /** A denominator after the figure, shown as "/118" in text-2. */
  of?: string;
  /** A unit before the figure in text-2 ("LVL"). */
  unit?: string;
  /** A unit after the figure in text-2 ("XP", "%"). */
  suffix?: string;
  /** The meta line under the figure ("Stickers · 8% of Season 1"). */
  meta?: string;
  /** 0–1: draws A's 2 px progress line under the meta. */
  progress?: number;
  /** Spoken name of the progress line (required with `progress`). */
  progressLabel?: string;
  /**
   * `hero`: the 80 px numeral with a 32 px denominator (the album total). `large` (default): a 34 px
   * numeral with 20 px units (LVL 8). `compact`: a 17 px numeral for dense stat rows.
   */
  size?: 'hero' | 'large' | 'compact';
  /** Spoken label of the figure; default "LVL 8" / "10 / 118". */
  accessibilityLabel?: string;
  testID?: string;
}

const FIGURE = { hero: 'hero', large: 'title', compact: 'num' } as const;
const UNIT = { hero: 'heroSub', large: 'unit', compact: 'numS' } as const;

/**
 * A's readout, the F1 "LAP 34/57" pattern: a big upright condensed numeral with a text-2 denominator
 * or unit on one baseline, a meta line under it, and an optional 2 px progress line under that.
 */
export function Readout({
  value,
  of,
  unit,
  suffix,
  meta,
  progress,
  progressLabel,
  size = 'large',
  accessibilityLabel,
  testID,
}: ReadoutProps) {
  const styles = useStyles();
  const spoken =
    accessibilityLabel ?? [unit, value, of !== undefined ? `/ ${of}` : undefined, suffix].filter(Boolean).join(' ');
  return (
    <View style={styles.base} testID={testID}>
      <Text
        variant={FIGURE[size]}
        accessibilityLabel={spoken}
        testID={testID !== undefined ? `${testID}-value` : undefined}
      >
        {unit !== undefined && <Text variant={UNIT[size]} tone="text2">{`${unit} `}</Text>}
        {value}
        {of !== undefined && <Text variant={UNIT[size]} tone="text2">{`/${of}`}</Text>}
        {suffix !== undefined && <Text variant={UNIT[size]} tone="text2">{` ${suffix}`}</Text>}
      </Text>
      {meta !== undefined && (
        <Text variant="meta" tone="text2">
          {meta}
        </Text>
      )}
      {progress !== undefined && (
        <View style={styles.progress}>
          <ProgressBar progress={progress} label={progressLabel ?? spoken} />
        </View>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  base: { gap: spacing.sm },
  progress: { paddingTop: spacing.xs },
}));
