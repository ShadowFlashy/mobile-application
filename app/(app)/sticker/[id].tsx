import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../src/components/primitives/Badge';
import { Card } from '../../../src/components/primitives/Card';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { Icon } from '../../../src/components/primitives/Icon';
import { Row } from '../../../src/components/primitives/Row';
import { Screen } from '../../../src/components/primitives/Screen';
import { Skeleton } from '../../../src/components/primitives/Skeleton';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { RarityBadge } from '../../../src/components/RarityBadge';
import { SpotCard } from '../../../src/components/SpotCard';
import { StyledButton } from '../../../src/components/StyledButton';
import { CATEGORY_ICONS } from '../../../src/constants/carCategories';
import { routes } from '../../../src/constants/routes';
import { useStickerBook } from '../../../src/hooks/useStickerBook';
import { radii, useTheme } from '../../../src/theme';

export default function StickerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { slots, isLoading, isError } = useStickerBook();
  const slot = slots.find((item) => item.model.id === id);

  if (slot === undefined && isLoading) {
    return (
      <Screen testID="sticker-detail-loading">
        <Stack gap="md">
          <Skeleton height={160} borderRadius={radii.md} />
          <Skeleton width="60%" height={24} />
          <Skeleton width="40%" height={16} />
        </Stack>
      </Screen>
    );
  }

  if (slot === undefined) {
    return (
      <Screen>
        <EmptyState
          icon="albums-outline"
          title={t('sticker_detail.not_found')}
          description={isError ? t('errors.load_collection') : undefined}
          action={<StyledButton label={t('common.back_to_sticker_book')} onPress={() => router.replace(routes.home)} />}
          testID="sticker-not-found"
        />
      </Screen>
    );
  }

  const { model, spots, isCollected } = slot;
  const carName = `${model.make} ${model.model}`;

  return (
    <Screen testID="sticker-detail-screen">
      <Stack gap="lg">
        <Card variant={isCollected ? 'highlight' : 'muted'}>
          <Stack gap="sm" padding="md">
            <Row gap="sm">
              <Badge label={t('sticker_detail.sticker_number', { number: model.stickerNumber })} variant="primary" />
              <RarityBadge rarity={model.rarity} />
            </Row>
            <Text size="xxl" weight="bold" heading testID="sticker-title">
              {carName}
            </Text>
            <Row gap="xs">
              <Icon name={CATEGORY_ICONS[model.category]} size={18} color={colors.textMuted} />
              <Text color={colors.textMuted}>{t(`categories.${model.category}`)}</Text>
            </Row>
            <Text weight="medium" testID="sticker-status">
              {isCollected
                ? t('sticker_detail.collected_status', { count: spots.length })
                : t('sticker_detail.not_collected')}
            </Text>
          </Stack>
        </Card>

        {isCollected ? (
          <Stack gap="sm">
            <Text size="lg" weight="bold" heading>
              {t('sticker_detail.your_spots')}
            </Text>
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} onPress={() => router.push(routes.spotDetail(spot.id))} />
            ))}
          </Stack>
        ) : (
          <EmptyState
            icon="lock-closed-outline"
            title={t('sticker_detail.locked_title')}
            description={t('sticker_detail.locked_description', { car: carName })}
            action={
              <StyledButton
                label={t('sticker_detail.spot_a_car')}
                icon="camera"
                onPress={() => router.push(routes.spot)}
              />
            }
            testID="sticker-locked"
          />
        )}
      </Stack>
    </Screen>
  );
}
