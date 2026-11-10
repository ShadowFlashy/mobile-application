import { View } from 'react-native';
import { createThemedStyles } from '../../theme';

interface KerbStripeProps {
  /** Default 4. */
  height?: 4 | 8;
  testID?: string;
}

const BLOCKS = 40;

/** A racing kerb: alternating red and white skewed blocks. Decorative, hidden from screen readers. */
export function KerbStripe({ height = 4, testID }: KerbStripeProps) {
  const styles = useStyles();
  return (
    <View
      style={[styles.strip, { height }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID}
    >
      {Array.from({ length: BLOCKS }, (_, index) => (
        <View key={index} style={[styles.block, { width: height * 4 }, index % 2 === 0 ? styles.red : styles.white]} />
      ))}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  strip: { flexDirection: 'row', width: '100%', overflow: 'hidden' },
  block: { height: '100%', transform: [{ skewX: '-20deg' }], marginHorizontal: -1 },
  red: { backgroundColor: colors.primary },
  white: { backgroundColor: colors.onPrimary },
}));
