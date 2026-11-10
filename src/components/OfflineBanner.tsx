import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, spacing, touchTarget } from '../theme';
import { Icon } from './primitives/Icon';
import { Text } from './primitives/Text';

interface OfflineBannerProps {
  visible: boolean;
}

/** "You are offline": a plain status row on the background with an icon and a bottom hairline. */
export function OfflineBanner({ visible }: OfflineBannerProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  if (!visible) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite" testID="offline-banner">
      <Icon name="offline" size={20} tone="text" />
      <View style={styles.message}>
        <Text variant="meta" tone="text">
          {t('offline.message')}
        </Text>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  banner: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.gutter,
    backgroundColor: colors.bg,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  // Lets the text wrap next to the icon on narrow phones instead of running off screen.
  message: { flexShrink: 1 },
}));
