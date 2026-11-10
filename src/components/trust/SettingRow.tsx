import { Pressable, View } from 'react-native';
import { createThemedStyles, spacing, touchTarget } from '../../theme';
import { Icon, type IconName } from '../primitives/Icon';
import { Text } from '../primitives/Text';

export interface SettingRowProps {
  icon: IconName;
  /** Already translated label. */
  label: string;
  /** Optional second line. */
  description?: string;
  /** Optional current value shown on the right (e.g. "Nederlands"). */
  value?: string;
  /** Makes the row a link or button with a chevron. Without it the row only shows information. */
  onPress?: () => void;
  /** `link` for rows that open another screen (default), `button` for rows that act in place. */
  accessibilityRole?: 'link' | 'button';
  testID?: string;
}

/**
 * One row of a settings list (Me, Trust Center): an icon tile, a label with an optional description,
 * an optional value and a chevron when it opens something. At least 48 dp high.
 */
export function SettingRow({
  icon,
  label,
  description,
  value,
  onPress,
  accessibilityRole = 'link',
  testID,
}: SettingRowProps) {
  const styles = useStyles();
  const content = (
    <>
      <View style={styles.iconTile}>
        <Icon name={icon} size={20} tone="default" />
      </View>
      <View style={styles.text}>
        <Text variant="bodyStrong">{label}</Text>
        {description !== undefined && (
          <Text variant="bodySm" tone="muted">
            {description}
          </Text>
        )}
      </View>
      {value !== undefined && (
        <Text variant="bodySm" tone="muted" numberOfLines={1}>
          {value}
        </Text>
      )}
      {onPress !== undefined && <Icon name="chevron-forward" size={18} tone="subtle" />}
    </>
  );

  if (onPress === undefined) {
    return (
      <View
        style={styles.row}
        testID={testID}
        accessible
        accessibilityLabel={[label, value].filter(Boolean).join(', ')}
      >
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={label}
      accessibilityHint={description}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID={testID}
    >
      {content}
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    minHeight: touchTarget + spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  text: { flex: 1, gap: spacing.xxs },
}));
