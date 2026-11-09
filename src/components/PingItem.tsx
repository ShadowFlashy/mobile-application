import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, radii, useTheme } from '../theme';
import type { SpotPing } from '../types/OwnerCar';
import { formatRelativeDate } from '../utils/formatDate';
import { Card } from './primitives/Card';
import { Icon } from './primitives/Icon';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';

interface PingItemProps {
  ping: SpotPing;
  onPress: () => void;
}

/** "Your car was spotted" notification row in the owner portal. */
export function PingItem({ ping, onPress }: PingItemProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();

  const spottedSentence = (car: string): string =>
    ping.locationLabel !== undefined
      ? t('ping_item.title_with_location', { car, location: ping.locationLabel })
      : t('ping_item.title', { car });

  const car = `${ping.carMake} ${ping.carModel}`;
  const title = spottedSentence(car);
  const when = formatRelativeDate(ping.spottedAt, i18n.language);
  // Screen readers hear the nickname inside the sentence, so two cars of the same model stay apart.
  const spokenTitle =
    ping.carNickname !== undefined
      ? spottedSentence(t('ping_item.car_with_nickname', { car, nickname: ping.carNickname }))
      : title;
  const accessibilityLabel = ping.isRead
    ? t('ping_item.accessibility_label', { title: spokenTitle, when })
    : t('ping_item.accessibility_label_unread', { title: spokenTitle, when });

  return (
    <Card
      onPress={onPress}
      variant={ping.isRead ? 'default' : 'highlight'}
      accessibilityLabel={accessibilityLabel}
      testID={`ping-${ping.id}`}
    >
      <Stack padding="md">
        <Row gap="md">
          <View style={styles.icon}>
            <Icon name="location" size={22} color={colors.accent} />
          </View>
          <Stack gap="xs" flex={1}>
            <Text weight="bold">{title}</Text>
            {ping.carNickname !== undefined && (
              <Text color={colors.textMuted}>{t('ping_item.nickname', { nickname: ping.carNickname })}</Text>
            )}
            <Text size="sm" color={colors.textMuted}>
              {when}
            </Text>
          </Stack>
          {!ping.isRead && <View style={styles.dot} accessibilityLabel={t('ping_item.unread')} />}
        </Row>
      </Stack>
    </Card>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Accent, not primary: the dot is a mark like an icon and must stand out on the highlight card in dark mode.
  dot: { width: 10, height: 10, borderRadius: radii.pill, backgroundColor: colors.accent },
}));
