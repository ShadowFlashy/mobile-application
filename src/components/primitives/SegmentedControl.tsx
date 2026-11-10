import { View } from 'react-native';
import { createThemedStyles, spacing, touchTarget } from '../../theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface SegmentOption<T extends string> {
  value: T;
  /** Already translated. */
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Each segment gets `<testID>-<value>`. */
  testID?: string;
}

/** A row of mutually exclusive options; the selected one is filled and bold (not colour alone). */
export function SegmentedControl<T extends string>({ options, value, onChange, testID }: SegmentedControlProps<T>) {
  const styles = useStyles();
  return (
    <View style={styles.track} accessibilityRole="radiogroup" testID={testID}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            checked={selected}
            selected={selected}
            haptic="tap"
            fill
            testID={testID !== undefined ? `${testID}-${option.value}` : undefined}
          >
            <View style={[styles.segment, selected && styles.selected]}>
              <Text
                variant={selected ? 'bodyStrong' : 'bodySm'}
                tone={selected ? 'default' : 'muted'}
                align="center"
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, elevation, radii }) => ({
  track: {
    flexDirection: 'row',
    gap: spacing.xxs,
    padding: spacing.xxs,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSunken,
  },
  segment: {
    flex: 1,
    minHeight: touchTarget - 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md - 2,
  },
  selected: { backgroundColor: colors.surface, ...elevation.raised },
}));
