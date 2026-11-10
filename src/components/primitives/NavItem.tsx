import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles, radii, spacing, touchTarget } from '../../theme';
import { Badge } from './Badge';
import { Icon, type IconName } from './Icon';
import { spaceKey } from './keyboard';
import { Text } from './Text';

interface NavItemProps {
  label: string;
  onPress: () => void;
  active?: boolean;
  icon?: IconName;
  /** A count badge on the icon, e.g. unread sightings. Hidden when 0. */
  badgeCount?: number;
  /**
   * `tab` (default): icon and label, text colour when active and text-2 otherwise. `key`: the red
   * Spot key (radius 10) holding the icon, with the label in text-2 under it.
   */
  variant?: 'tab' | 'key';
  testID?: string;
}

/** Icon area height and the Spot key's size (A-Album tab bar). */
const ICON_ROW = 32;
const KEY_WIDTH = 52;

/**
 * One tab of the bottom bar. The active tab is the text colour (never red) and is announced as
 * selected; the Spot key is the one red element of the bar.
 */
export function NavItem({
  label,
  onPress,
  active = false,
  icon,
  badgeCount = 0,
  variant = 'tab',
  testID,
}: NavItemProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const isKey = variant === 'key';
  // Active is the text colour for every tab, the Spot key included (its icon stays white on red).
  const tone = active ? 'text' : 'text2';
  return (
    <Pressable
      onPress={onPress}
      {...spaceKey(onPress)}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      aria-selected={active}
      accessibilityLabel={badgeCount > 0 ? t('a11y.nav_badge', { label, count: badgeCount }) : label}
      style={({ pressed }) => [styles.base, pressed && !isKey && styles.pressed]}
      testID={testID}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.iconRow, isKey && styles.key, isKey && pressed && styles.keyPressed]}>
            {icon !== undefined && <Icon name={icon} size={24} tone={isKey ? 'onRed' : tone} />}
            {badgeCount > 0 && (
              <View style={styles.badge}>
                <Badge count={badgeCount} testID={testID !== undefined ? `${testID}-badge` : undefined} />
              </View>
            )}
          </View>
          <Text variant="tab" tone={tone} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: {
    flex: 1,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.xxs,
  },
  pressed: { opacity: 0.6 },
  iconRow: { height: ICON_ROW, minWidth: ICON_ROW, alignItems: 'center', justifyContent: 'center' },
  key: { width: KEY_WIDTH, borderRadius: radii.key, backgroundColor: colors.red },
  // The Spot key darkens while pressed (redPressed) instead of fading to a washed-out red.
  keyPressed: { backgroundColor: colors.redPressed },
  badge: { position: 'absolute', top: -1, end: -12 },
}));
