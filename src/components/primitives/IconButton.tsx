import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, touchTarget, useTheme, type ThemeColors } from '../../theme';
import { Badge } from './Badge';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

/**
 * `plain` (default): a text-colour icon. `filled`: the red primary action (white icon); use it only
 * for the one primary action on a screen. `onStage`: a light icon on the photo stage.
 */
export type IconButtonVariant = 'plain' | 'filled' | 'onStage';

interface IconButtonProps {
  icon: IconName;
  /** Accessible label: an icon-only control always has one. */
  label: string;
  onPress: () => void;
  /** A count badge on the icon. Hidden when 0 or undefined. */
  badgeCount?: number;
  /** Default `plain`. */
  variant?: IconButtonVariant;
  disabled?: boolean;
  testID?: string;
}

const ICON_TOKENS: Record<IconButtonVariant, keyof ThemeColors> = {
  plain: 'text',
  filled: 'onRed',
  onStage: 'onStage',
};

/** A 44 × 44 icon-only button with an optional count badge. */
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
      {({ pressed }) => (
        <View style={[styles.base, styles[variant], pressed && variant === 'filled' && styles.filledPressed]}>
          <Icon name={icon} size={24} color={colors[ICON_TOKENS[variant]]} />
          {hasBadge && (
            <View style={styles.badge}>
              <Badge count={badgeCount} testID={testID !== undefined ? `${testID}-badge` : undefined} />
            </View>
          )}
        </View>
      )}
    </PressableScale>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  base: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plain: { backgroundColor: 'transparent' },
  filled: { backgroundColor: colors.red },
  filledPressed: { backgroundColor: colors.redPressed },
  onStage: { backgroundColor: 'transparent' },
  badge: { position: 'absolute', top: 2, end: 0 },
}));
