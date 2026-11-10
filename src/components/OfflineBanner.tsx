import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../theme';
import { Icon } from './primitives/Icon';
import { Text } from './primitives/Text';

interface OfflineBannerProps {
  visible: boolean;
}

/** "No internet connection" banner: a pit-board strip with a marshal-yellow edge. */
export function OfflineBanner({ visible }: OfflineBannerProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  if (!visible) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite" testID="offline-banner">
      <Icon name="cloud-offline-outline" size={18} tone="inverse" />
      <View style={styles.message}>
        <Text variant="bodySm" tone="inverse">
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
    borderBottomWidth: 3,
    borderBottomColor: colors.signal,
  },
  // Lets the text wrap next to the icon on narrow phones instead of running off screen.
  message: { flexShrink: 1 },
}));
