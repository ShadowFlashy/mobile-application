import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, spacing, useTheme, type ThemeColors } from '../../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type TagTone = 'default' | 'accent' | 'auto';

interface TagProps {
  label: string;
  onRemove?: () => void;
  /** Makes the tag a selectable chip, e.g. for filters. */
  onPress?: () => void;
  selected?: boolean;
  icon?: IconName;
  /** `auto` is the signal-yellow AUTO tag for values Co-Driver or the phone filled in. Default `default`. */
  tone?: TagTone;
  testID?: string;
}

export function Tag({ label, onRemove, onPress, selected = false, icon, tone = 'default', testID }: TagProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const ink: keyof ThemeColors = selected
    ? 'text'
    : tone === 'auto'
      ? 'onSignal'
      : tone === 'accent'
        ? 'accent'
        : 'text';
  const content = (
    <>
      {selected && <Icon name="checkmark" size={14} color={colors[ink]} />}
      {icon !== undefined && <Icon name={icon} size={14} color={colors[ink]} />}
      <Text variant={tone === 'auto' ? 'label' : selected ? 'bodyStrong' : 'bodySm'} color={colors[ink]}>
        {label}
      </Text>
      {onRemove !== undefined && (
        <Pressable
          onPress={onRemove}
          hitSlop={spacing.sm}
          style={styles.removeButton}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.remove_tag', { label })}
        >
          <Icon name="close" size={14} color={colors[ink]} />
        </Pressable>
      )}
    </>
  );

  const toneStyle = selected ? styles.selected : styles[tone];

  if (onPress !== undefined) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        aria-selected={selected}
        style={({ pressed }) => [styles.base, tone === 'auto' && styles.compact, toneStyle, pressed && styles.pressed]}
        testID={testID}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.base, tone === 'auto' && styles.compact, toneStyle]} testID={testID}>
      {content}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.smd,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  compact: { minHeight: 22, paddingHorizontal: spacing.sm, borderRadius: radii.sm },
  default: { borderColor: colors.borderStrong, backgroundColor: colors.surface },
  accent: { borderColor: colors.accent, backgroundColor: colors.primarySoft },
  auto: { borderColor: colors.signal, backgroundColor: colors.signal },
  // Selected chips: soft red fill, red border and a check mark (never colour alone).
  selected: { backgroundColor: colors.primarySoft, borderColor: colors.accent },
  pressed: { opacity: 0.8 },
  removeButton: { paddingHorizontal: spacing.xs },
}));
