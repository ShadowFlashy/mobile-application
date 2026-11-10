import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, lines, spacing, touchTarget } from '../../theme';
import { Icon } from './Icon';
import { Text } from './Text';

interface MenuItem {
  label: string;
  onPress: () => void;
  /** A destructive item gets a trash icon (never red text). */
  destructive?: boolean;
}

interface MenuProps {
  items: MenuItem[];
  visible: boolean;
  onClose: () => void;
}

/** A flat `raise` menu with a hairline border (radius 8) and hairline-separated 44 px items. */
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
        {items.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={() => {
              item.onPress();
              onClose();
            }}
            accessibilityRole="menuitem"
            style={({ pressed }) => [styles.menuItem, index > 0 && styles.separator, pressed && styles.pressed]}
          >
            <Text variant="body">{item.label}</Text>
            {item.destructive === true && <Icon name="trash" size={20} tone="text2" />}
          </Pressable>
        ))}
      </View>
    </>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  overlay: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0 },
  menu: {
    position: 'absolute',
    top: spacing.xl,
    end: spacing.gutter,
    minWidth: 200,
    backgroundColor: colors.raise,
    borderRadius: radii.md,
    borderWidth: lines.hairline,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  menuItem: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.smd,
    paddingHorizontal: spacing.md,
  },
  separator: { borderTopWidth: lines.hairline, borderTopColor: colors.line },
  pressed: { backgroundColor: colors.line },
}));
