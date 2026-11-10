import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlbumSkeleton } from '../../../src/components/album/AlbumSkeleton';
import { PaintSwatch } from '../../../src/components/capture/PaintSwatch';
import { ProvenanceTag } from '../../../src/components/capture/ProvenanceTag';
import { ConfirmDialog } from '../../../src/components/ConfirmDialog';
import { OwnerShowcase } from '../../../src/components/garage/OwnerShowcase';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { PhotoFrame } from '../../../src/components/primitives/PhotoFrame';
import { Row } from '../../../src/components/primitives/Row';
import { Screen } from '../../../src/components/primitives/Screen';
import { Section } from '../../../src/components/primitives/Section';
import { Stack } from '../../../src/components/primitives/Stack';
import { Tag } from '../../../src/components/primitives/Tag';
import { Text } from '../../../src/components/primitives/Text';
import { RarityBadge } from '../../../src/components/RarityBadge';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useCarModels } from '../../../src/hooks/useCarModels';
import { useNetworkStatus } from '../../../src/hooks/useNetworkStatus';
import { useDeleteSpot, useSpot, useSpotShowcase } from '../../../src/hooks/useSpots';
import { getErrorMessage } from '../../../src/services/serviceError';
import { useAuthStore } from '../../../src/state/useAuthStore';
import { useToastStore } from '../../../src/state/useToastStore';
import { formatDate, formatRelativeDate } from '../../../src/utils/formatDate';

/** One spot: the redacted photo, identity, provenance, city and date, notes, owner showcase, delete. */
export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const spotQuery = useSpot(id);
  const { data: carModels } = useCarModels();
  const showcase = useSpotShowcase(id).data;
  const { isOnline } = useNetworkStatus();
  const userId = useAuthStore((state) => state.user?.id);
  const deleteSpot = useDeleteSpot();
  const showToast = useToastStore((state) => state.show);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (spotQuery.isPending) {
    return (
      <Screen testID="spot-detail-loading">
        <AlbumSkeleton variant="page" />
      </Screen>
    );
  }

  const spot = spotQuery.data;
  // Offline, a failed refresh keeps showing the cached spot (read-only offline).
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
          action={<StyledButton label={t('album.back_to_album')} onPress={() => router.replace(routes.home)} />}
          testID="spot-not-found"
        />
      </Screen>
    );
  }

  const car = `${spot.make} ${spot.model}`;
  const carModel = carModels?.find((model) => model.id === spot.carModelId);
  const isOwnSpot = spot.userId === userId;
  const relative = formatRelativeDate(spot.spottedAt, i18n.language);
  const date = formatDate(spot.spottedAt, i18n.language);
  // After a week the relative date is the date itself: then it is shown only once.
  const spotted =
    relative === date ? t('spot_detail.spotted_on', { date }) : t('spot_detail.spotted_ago', { relative, date });
  const years =
    spot.yearFrom === undefined
      ? undefined
      : spot.yearTo !== undefined
        ? t('spot_detail.years_range', { from: spot.yearFrom, to: spot.yearTo })
        : t('spot_detail.years_since', { from: spot.yearFrom });
  const provenance =
    spot.identifiedBy === 'ai'
      ? spot.aiConfidence !== undefined
        ? t('spot_detail.provenance_ai', { percent: Math.round(spot.aiConfidence * 100) })
        : t('spot_detail.provenance_ai_plain')
      : spot.identifiedBy === 'ai_edited'
        ? t('spot_detail.provenance_edited')
        : t('spot_detail.provenance_manual');

  // Optimistic delete: the spot leaves the album at once, so the screen goes back right away. If
  // deleting fails, the spot comes back and the toast explains why.
  const onDelete = async () => {
    setIsConfirmOpen(false);
    if (router.canGoBack()) router.back();
    else router.replace(routes.home);
    try {
      await deleteSpot.mutateAsync(spot);
      showToast(t('spot_detail.deleted_toast'), 'success');
    } catch (error) {
      showToast(getErrorMessage(error, 'delete_spot'), 'error');
    }
  };

  return (
    <Screen testID="spot-detail-screen">
      <Stack gap="lg">
        <PhotoFrame
          uri={spot.photoUrl}
          cacheKey={spot.photoPath}
          fit="contain"
          accessibilityLabel={t('spot_detail.photo_label', { car })}
          testID="spot-photo"
        />

        <Stack gap="sm">
          <Row gap="sm" wrap>
            {carModel !== undefined ? (
              <>
                <Tag
                  label={t('spot_detail.sticker_number', { number: carModel.stickerNumber })}
                  icon="albums-outline"
                  onPress={() => router.push(routes.sticker(carModel.id))}
                  testID="spot-sticker-link"
                />
                <RarityBadge rarity={carModel.rarity} />
              </>
            ) : (
              <Tag label={t('spot_detail.wildcard')} icon="help-circle-outline" tone="accent" />
            )}
          </Row>
          <Text variant="display" heading testID="spot-title">
            {car}
          </Text>
          <Row gap="sm" wrap testID="spot-chips">
            {spot.generation !== undefined && <Tag label={spot.generation} />}
            {years !== undefined && <Tag label={years} icon="calendar-outline" />}
            <PaintSwatch paint={spot.paint} size="sm" />
            <Tag label={t(`body_style.${spot.bodyStyle}`)} icon="car-sport-outline" />
          </Row>
        </Stack>

        <Stack gap="xs">
          <Row gap="sm">
            <ProvenanceTag provenance={spot.identifiedBy === 'ai' ? 'ai' : 'user'} />
            <Text variant="bodySm" tone="muted" testID="spot-provenance">
              {provenance}
            </Text>
          </Row>
          <Text tone="muted" testID="spot-meta">
            {spot.city !== undefined ? `${spot.city} · ${spotted}` : spotted}
          </Text>
          <Text variant="caption" tone="subtle" testID="spot-plates">
            {spot.platesHidden > 0
              ? t('spot_detail.plates_hidden', { count: spot.platesHidden })
              : t('spot_detail.plates_none')}
          </Text>
        </Stack>

        {showcase !== undefined && (
          <Section title={t('spot_detail.showcase_title')} testID="spot-owner-showcase">
            <OwnerShowcase showcase={showcase} />
          </Section>
        )}

        {isOwnSpot && spot.notes !== undefined && (
          <Section title={t('spot_detail.notes')} testID="spot-notes">
            <Text>{spot.notes}</Text>
          </Section>
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
