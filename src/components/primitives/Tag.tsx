import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, radii, spacing, useTheme } from '../../theme';
import { Icon } from './Icon';
import { Text } from './Text';

interface TagProps {
  label: string;
  onRemove?: () => void;
  /** Makes the tag a selectable chip, e.g. for filters. */
  onPress?: () => void;
  selected?: boolean;
  testID?: string;
}

export function Tag({ label, onRemove, onPress, selected = false, testID }: TagProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const content = (
    <>
      <Text size="sm" weight={selected ? 'bold' : 'medium'} color={selected ? colors.onPrimary : colors.text}>
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
          <Icon name="close" size={14} color={selected ? colors.onPrimary : colors.textMuted} />
        </Pressable>
      )}
    </>
  );

  if (onPress !== undefined) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        aria-selected={selected}
        style={({ pressed }) => [styles.base, selected && styles.selected, pressed && styles.pressed]}
        testID={testID}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.base, selected && styles.selected]} testID={testID}>
      {content}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.md - 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { opacity: 0.8 },
  removeButton: { paddingHorizontal: spacing.xs },
}));
