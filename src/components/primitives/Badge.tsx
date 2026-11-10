import { View } from 'react-native';
import { createThemedStyles, lines, spacing } from '../../theme';
import { Text } from './Text';

interface BadgeProps {
  /** The count to show; above `max` it reads "9+". */
  count?: number;
  /** Default 9. */
  max?: number;
  /** @deprecated A short text instead of a count (e.g. "2 new"); prefer `count`. */
  label?: string;
  /** Spoken text when the badge stands alone; usually the parent announces the count instead. */
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * A's count badge: a text-colour disc with a bg-colour digit and a cut-out ring in the background
 * colour, so it reads on top of an icon (the Garage tab).
 */
export function Badge({ count, max = 9, label, accessibilityLabel, testID }: BadgeProps) {
  const styles = useStyles();
  const text = count !== undefined ? (count > max ? `${max}+` : String(count)) : (label ?? '');
  return (
    <View
      style={styles.badge}
      accessible={accessibilityLabel !== undefined}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Text variant="mark" tone="inverse" numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const SIZE = 20;

const useStyles = createThemedStyles(({ colors, radii }) => ({
  badge: {
    alignSelf: 'flex-start',
    minWidth: SIZE,
    height: SIZE,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: lines.underline,
    borderColor: colors.bg,
    backgroundColor: colors.inverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
