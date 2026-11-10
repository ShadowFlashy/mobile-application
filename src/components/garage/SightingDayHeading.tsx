import { View } from 'react-native';
import { createThemedStyles, rowHeights, spacing } from '../../theme';
import { Text } from '../primitives/Text';

interface SightingDayHeadingProps {
  /** Already translated: "Today", "Yesterday" or a date. */
  label: string;
  testID?: string;
}

/**
 * The day break in the sightings feed: a quiet text-2 line on a 40 px row, sitting on the bottom of
 * the row so it reads with the rows under it. No box, no small caps.
 */
export function SightingDayHeading({ label, testID }: SightingDayHeadingProps) {
  const styles = useStyles();
  return (
    <View style={styles.row} testID={testID}>
      <Text variant="meta" tone="text2" heading>
        {label}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  row: { minHeight: rowHeights.compact, justifyContent: 'flex-end', paddingBottom: spacing.xs },
}));
