import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, spacing, touchTarget, useTheme } from '../../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface NavItemProps {
  label: string;
  onPress: () => void;
  active?: boolean;
  icon?: IconName;
  /** Small counter on the icon, e.g. unread sightings. Hidden when 0. */
  badgeCount?: number;
  testID?: string;
}

/**
 * One tab. The active tab gets the red indicator bar, a filled icon and bold text, so the state is
 * never shown by colour alone.
 */
export function NavItem({ label, onPress, active = false, icon, badgeCount = 0, testID }: NavItemProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const tint = active ? colors.text : colors.textMuted;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      aria-selected={active}
      accessibilityLabel={badgeCount > 0 ? t('a11y.nav_badge', { label, count: badgeCount }) : label}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
      testID={testID}
    >
      <View style={[styles.indicator, active && styles.indicatorActive]} />
      {icon !== undefined && (
        <View>
          <Icon name={icon} size={24} color={tint} />
          {badgeCount > 0 && (
            <View style={styles.badge} testID={testID !== undefined ? `${testID}-badge` : undefined}>
              <Text variant="caption" tone="onPrimary">
                {badgeCount > 9 ? '9+' : String(badgeCount)}
              </Text>
            </View>
          )}
        </View>
      )}
      <Text variant={active ? 'label' : 'caption'} color={tint} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  base: {
    flex: 1,
    minHeight: touchTarget + 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingBottom: spacing.xxs,
  },
  pressed: { opacity: 0.7 },
  indicator: { width: 28, height: 3, borderRadius: radii.pill, marginBottom: spacing.xxs },
  indicatorActive: { backgroundColor: colors.primary },
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
