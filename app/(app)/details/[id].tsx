import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ConfirmDialog } from '../../../src/components/ConfirmDialog';
import { Badge } from '../../../src/components/primitives/Badge';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { Icon } from '../../../src/components/primitives/Icon';
import { Row } from '../../../src/components/primitives/Row';
import { Screen } from '../../../src/components/primitives/Screen';
import { Skeleton } from '../../../src/components/primitives/Skeleton';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { RarityBadge } from '../../../src/components/RarityBadge';
import { StyledButton } from '../../../src/components/StyledButton';
import { VanityPlate } from '../../../src/components/VanityPlate';
import { routes } from '../../../src/constants/routes';
import { useCarModels } from '../../../src/hooks/useCarModels';
import { useNetworkStatus } from '../../../src/hooks/useNetworkStatus';
import { useDeleteSpot, useSpot } from '../../../src/hooks/useSpots';
import { getErrorMessage } from '../../../src/services/serviceError';
import { useAuthStore } from '../../../src/state/useAuthStore';
import { useToastStore } from '../../../src/state/useToastStore';
import { createThemedStyles, radii, useTheme } from '../../../src/theme';
import { formatDate, formatRelativeDate } from '../../../src/utils/formatDate';

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const spotQuery = useSpot(id);
  const { data: carModels } = useCarModels();
  const { isOnline } = useNetworkStatus();
  const userId = useAuthStore((state) => state.user?.id);
  const deleteSpot = useDeleteSpot();
  const showToast = useToastStore((state) => state.show);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (spotQuery.isPending) {
    return (
      <Screen testID="spot-detail-loading">
        <Stack gap="md">
          <Skeleton height={240} borderRadius={radii.md} />
          <Skeleton width="60%" height={24} />
          <Skeleton width="40%" height={16} />
        </Stack>
      </Screen>
    );
  }

  const spot = spotQuery.data;
  // Offline, a failed refresh keeps showing the cached spot (course ch. 22: read-only offline).
  if (spot === undefined || (spotQuery.isError && isOnline)) {
    return (
      <Screen>
        <EmptyState
          icon="search-outline"
          title={t('spot_detail.not_found')}
          description={
            spotQuery.isError
              ? getErrorMessage(spotQuery.error, 'spot_not_found')
              : t('spot_detail.not_found_description')
          }
          action={<StyledButton label={t('common.back_to_sticker_book')} onPress={() => router.replace(routes.home)} />}
          testID="spot-not-found"
        />
      </Screen>
    );
  }

  const carName = `${spot.make} ${spot.model}`;
  const carModel = carModels?.find((model) => model.id === spot.carModelId);
  const isOwnSpot = spot.userId === userId;
  const relative = formatRelativeDate(spot.spottedAt, i18n.language);
  const date = formatDate(spot.spottedAt, i18n.language);
  // After a week the relative date is the date itself: then it is shown only once.
  const spottedText =
    relative === date ? t('spot_detail.spotted_on', { date }) : t('spot_detail.spotted_ago', { relative, date });

  // Optimistic delete: the spot leaves the sticker book at once, so the screen goes back right away
  // (once deleted, this spot can no longer be loaded here). If deleting fails, the spot comes back
  // and the toast explains why.
  const onDelete = async () => {
    setIsConfirmOpen(false);
    if (router.canGoBack()) router.back();
    else router.replace(routes.home);
    try {
      await deleteSpot.mutateAsync(spot);
      showToast(t('spot_detail.deleted_toast'));
    } catch (error) {
      showToast(getErrorMessage(error, 'delete_spot'), 'error');
    }
  };

  return (
    <Screen testID="spot-detail-screen">
      <Stack gap="lg">
        <View style={styles.photoFrame}>
          {spot.photoUrl !== undefined ? (
            <Image
              source={{ uri: spot.photoUrl, cacheKey: spot.photoPath }}
              contentFit="contain"
              style={styles.photo}
              accessibilityLabel={t('spot_detail.photo_label', { car: carName })}
              testID="spot-photo"
            />
          ) : (
            <Icon name="image-outline" size={48} color={colors.textSubtle} />
          )}
        </View>

        <Stack gap="sm">
          {carModel !== undefined && (
            <Row gap="sm">
              <Badge label={t('spot_detail.sticker_number', { number: carModel.stickerNumber })} variant="primary" />
              <RarityBadge rarity={carModel.rarity} />
            </Row>
          )}
          <Text size="xxl" weight="bold" heading testID="spot-title">
            {carName}
          </Text>
          <Text color={colors.textMuted} testID="spot-meta">
            {spottedText}
          </Text>
          {spot.locationLabel !== undefined && (
            <Row gap="xs">
              <Icon name="location-outline" size={16} color={colors.textMuted} />
              <Text color={colors.textMuted} testID="spot-location">
                {spot.locationLabel}
              </Text>
            </Row>
          )}
        </Stack>

        {spot.ownerCarId !== undefined && (
          <Stack gap="sm">
            <Badge label={t('spot_detail.owner_badge')} variant="success" />
            {spot.vanityPlate !== undefined && <VanityPlate plate={spot.vanityPlate} />}
          </Stack>
        )}

        {spot.notes !== undefined && (
          <Stack gap="xs">
            <Text weight="bold" heading>
              {t('spot_detail.notes')}
            </Text>
            <Text>{spot.notes}</Text>
          </Stack>
        )}

        {isOwnSpot && (
          <StyledButton
            label={t('spot_detail.delete')}
            icon="trash-outline"
            variant="ghost"
            onPress={() => setIsConfirmOpen(true)}
            testID="delete-spot-button"
          />
        )}
      </Stack>

      <ConfirmDialog
        visible={isConfirmOpen}
        title={t('spot_detail.delete_title')}
        message={t('spot_detail.delete_message')}
        confirmLabel={t('common.delete')}
        destructive
        isLoading={deleteSpot.isPending}
        onConfirm={() => void onDelete()}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </Screen>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  photoFrame: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.photoBackdrop,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: '100%', height: '100%' },
}));
