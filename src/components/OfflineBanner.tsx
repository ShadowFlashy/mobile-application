import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, spacing, useTheme } from '../theme';
import { Icon } from './primitives/Icon';
import { Text } from './primitives/Text';

interface OfflineBannerProps {
  visible: boolean;
}

/** "No internet connection" banner (course ch. 8: mobile-specific reactivity). */
export function OfflineBanner({ visible }: OfflineBannerProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  if (!visible) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite" testID="offline-banner">
      <Icon name="cloud-offline-outline" size={18} color={colors.onInverse} />
      <View style={styles.message}>
        <Text size="sm" weight="medium" color={colors.onInverse}>
          {t('offline.message')}
        </Text>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.inverseSurface,
  },
  // Lets the text wrap next to the icon on narrow phones instead of running off screen.
  message: { flexShrink: 1 },
}));
