import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, radii, touchTarget, useTheme } from '../../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface NavItemProps {
  label: string;
  onPress: () => void;
  active?: boolean;
  icon?: IconName;
  /** Small counter on the icon, e.g. unread pings. Hidden when 0. */
  badgeCount?: number;
  testID?: string;
}

export function NavItem({ label, onPress, active = false, icon, badgeCount = 0, testID }: NavItemProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const tint = active ? colors.accent : colors.textMuted;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={badgeCount > 0 ? t('a11y.nav_badge', { label, count: badgeCount }) : label}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
      testID={testID}
    >
      {icon !== undefined && (
        <View>
          <Icon name={icon} size={24} color={tint} />
          {badgeCount > 0 && (
            <View style={styles.badge}>
              <Text size="sm" weight="bold" color={colors.onPrimary}>
                {badgeCount > 9 ? '9+' : String(badgeCount)}
              </Text>
            </View>
          )}
        </View>
      )}
      <Text size="sm" weight={active ? 'bold' : 'normal'} color={tint}>
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: {
    flex: 1,
    minHeight: touchTarget + 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  pressed: { opacity: 0.7 },
  badge: {
    position: 'absolute',
    top: -4,
    end: -12,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.dangerFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
