import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, spacing, touchTarget } from '../../theme';
import { Text } from './Text';

interface MenuItem {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface MenuProps {
  items: MenuItem[];
  visible: boolean;
  onClose: () => void;
}

export function Menu({ items, visible, onClose }: MenuProps) {
  const { t } = useTranslation();
  const styles = useStyles();

  if (!visible) return null;

  return (
    <>
      <Pressable
        onPress={onClose}
        style={styles.overlay}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.close_menu')}
      />
      <View style={styles.menu} accessibilityRole="menu">
        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => {
              item.onPress();
              onClose();
            }}
            accessibilityRole="menuitem"
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
          >
            <Text variant="bodyStrong" tone={item.destructive === true ? 'danger' : 'default'}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

const useStyles = createThemedStyles(({ colors, elevation, radii }) => ({
  overlay: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0 },
  menu: {
    position: 'absolute',
    top: spacing.xl,
    end: spacing.md,
    minWidth: 200,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    ...elevation.lifted,
  },
  menuItem: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
}));
