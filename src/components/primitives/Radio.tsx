import { Pressable, View } from 'react-native';
import { borders, createThemedStyles, spacing, touchTarget } from '../../theme';
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
      <Text variant={selected ? 'bodyStrong' : 'body'}>{label}</Text>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.smd, minHeight: touchTarget },
  circle: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: borders.strong,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: { borderColor: colors.text },
  dot: { width: 12, height: 12, borderRadius: radii.pill, backgroundColor: colors.text },
}));
