import { Pressable, View } from 'react-native';
import { createThemedStyles, radii, spacing, touchTarget } from '../../theme';
import { Text } from './Text';

interface RadioProps {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  testID?: string;
}

export function Radio({ label, value, selected, onSelect, testID }: RadioProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={() => onSelect(value)}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={styles.container}
      testID={testID}
    >
      <View style={[styles.circle, selected && styles.circleSelected]}>{selected && <View style={styles.dot} />}</View>
      <Text size="md">{label}</Text>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: touchTarget },
  circle: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: { borderColor: colors.primary },
  dot: { width: 10, height: 10, borderRadius: radii.pill, backgroundColor: colors.primary },
}));
