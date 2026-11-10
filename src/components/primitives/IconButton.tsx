import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, touchTarget, useTheme, type ThemeColors } from '../../theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type IconButtonVariant = 'plain' | 'filled' | 'onStage';

interface IconButtonProps {
  icon: IconName;
  /** Accessible label: an icon-only control always has one. */
  label: string;
  onPress: () => void;
  /** Small counter on the icon. Hidden when 0 or undefined. */
  badgeCount?: number;
  /** Default `plain`. */
  variant?: IconButtonVariant;
  disabled?: boolean;
  testID?: string;
}

const ICON_TOKENS: Record<IconButtonVariant, keyof ThemeColors> = {
  plain: 'text',
  filled: 'onPrimary',
  onStage: 'onStage',
};

/** A 48 dp icon-only button with an optional unread badge. */
export function IconButton({
  icon,
  label,
  onPress,
  badgeCount = 0,
  variant = 'plain',
  disabled,
  testID,
}: IconButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const hasBadge = badgeCount > 0;
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.94}
      haptic="tap"
      disabled={disabled}
      accessibilityLabel={hasBadge ? t('a11y.nav_badge', { label, count: badgeCount }) : label}
      testID={testID}
    >
      <View style={[styles.base, styles[variant]]}>
        <Icon name={icon} size={24} color={colors[ICON_TOKENS[variant]]} />
        {hasBadge && (
          <View style={styles.badge} testID={testID !== undefined ? `${testID}-badge` : undefined}>
            <Text variant="caption" tone="onPrimary">
              {badgeCount > 9 ? '9+' : String(badgeCount)}
            </Text>
          </View>
        )}
      </View>
    </PressableScale>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  base: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plain: { backgroundColor: 'transparent' },
  filled: { backgroundColor: colors.primary },
  onStage: { backgroundColor: colors.overlay },
  badge: {
    position: 'absolute',
    top: 4,
    end: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.dangerFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
