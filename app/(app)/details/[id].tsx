import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlbumSkeleton } from '../../../src/components/album/AlbumSkeleton';
import { stickerNo, useAlbumTitles } from '../../../src/components/album/albumLabels';
import { PaintValue } from '../../../src/components/album/PaintValue';
import { SectionText } from '../../../src/components/album/SectionText';
import { ShowcaseRows } from '../../../src/components/album/ShowcaseRows';
import { ConfirmDialog } from '../../../src/components/ConfirmDialog';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { ListRow } from '../../../src/components/primitives/ListRow';
import { PhotoFrame } from '../../../src/components/primitives/PhotoFrame';
import { RarityRoundel } from '../../../src/components/primitives/RarityRoundel';
import { Row } from '../../../src/components/primitives/Row';
import { Screen } from '../../../src/components/primitives/Screen';
import { Section } from '../../../src/components/primitives/Section';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useAlbum } from '../../../src/hooks/useAlbum';
import { useCarModels } from '../../../src/hooks/useCarModels';
import { useNetworkStatus } from '../../../src/hooks/useNetworkStatus';
import { useDeleteSpot, useSpot, useSpotShowcase } from '../../../src/hooks/useSpots';
import { getErrorMessage } from '../../../src/services/serviceError';
import { useAuthStore } from '../../../src/state/useAuthStore';
import { useToastStore } from '../../../src/state/useToastStore';
import { collectionsOfModel } from '../../../src/utils/album';
import { formatDate, formatRelativeDate } from '../../../src/utils/formatDate';

/** One spot: the redacted photo, the car, hairline detail rows, the owner showcase, notes and delete. */
export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const spotQuery = useSpot(id);
  const { data: carModels } = useCarModels();
  const { slotByModelId, collections } = useAlbum();
  const { collectionTitle } = useAlbumTitles();
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
          icon="search"
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
  const spotted = relative === date ? date : t('spot_detail.date_relative', { relative, date });
  const years =
    spot.yearFrom === undefined
      ? undefined
      : spot.yearTo !== undefined
        ? t('spot_detail.years_range', { from: spot.yearFrom, to: spot.yearTo })
        : t('spot_detail.years_since', { from: spot.yearFrom });
  const facts = [spot.generation, years, t(`body_style.${spot.bodyStyle}`)].filter(Boolean).join(' · ');
  const provenance =
    spot.identifiedBy === 'ai'
      ? spot.aiConfidence !== undefined
        ? t('spot_detail.provenance_ai', { percent: Math.round(spot.aiConfidence * 100) })
        : t('spot_detail.provenance_ai_plain')
      : spot.identifiedBy === 'ai_edited'
        ? t('spot_detail.provenance_edited')
        : t('spot_detail.provenance_manual');
  const timesSpotted = carModel !== undefined ? (slotByModelId(carModel.id)?.spots.length ?? 1) : 1;
  const firstSet = carModel !== undefined ? collectionsOfModel(collections, carModel.id)[0] : undefined;

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
          <Text
            variant="title"
            heading
            accessibilityLabel={
              carModel !== undefined ? t('spot_detail.title_label', { number: carModel.stickerNumber, car }) : undefined
            }
            testID="spot-title"
          >
            {carModel !== undefined && (
              <Text variant="title" tone="text2">
                {'#'}
              </Text>
            )}
            {carModel !== undefined ? `${stickerNo(carModel.stickerNumber)} ${car}` : car}
          </Text>
          <Row gap="smd" align="center" wrap testID="spot-chips">
            {carModel !== undefined && <RarityRoundel rarity={carModel.rarity} showLabel />}
            <Text variant="meta" tone="text2">
              {facts}
            </Text>
          </Row>
        </Stack>

        <Section title={t('spot_detail.details')} testID="spot-details">
          <ListRow kind="detail" title={t('spot_detail.date')} value={spotted} testID="spot-meta" />
          {spot.city !== undefined && <ListRow kind="detail" title={t('spot_detail.city')} value={spot.city} />}
          <ListRow kind="detail" title={t('spot_detail.paint')} trailing={<PaintValue paint={spot.paint} />} />
          {carModel !== undefined ? (
            <ListRow
              kind="detail"
              title={t('spot_detail.sticker')}
              value={t('spot_detail.sticker_number', { number: stickerNo(carModel.stickerNumber) })}
              chevron
              onPress={() => router.push(routes.sticker(carModel.id))}
              testID="spot-sticker-link"
            />
          ) : (
            <ListRow kind="detail" title={t('spot_detail.sticker')} value={t('spot_detail.wildcard')} />
          )}
          {firstSet !== undefined && (
            <ListRow
              kind="detail"
              title={t('spot_detail.set')}
              value={collectionTitle(firstSet.collectionId)}
              chevron
              onPress={() => router.push(routes.albumCollection(firstSet.collectionId))}
              testID="spot-set-link"
            />
          )}
          {carModel !== undefined && (
            <ListRow
              kind="detail"
              title={t('spot_detail.spotted')}
              value={t('spot_detail.spotted_count', { count: timesSpotted })}
              testID="spot-count"
            />
          )}
          <ListRow kind="detail" title={t('spot_detail.identified')} value={provenance} testID="spot-provenance" />
          <ListRow
            kind="detail"
            title={t('spot_detail.plates')}
            value={
              spot.platesHidden > 0
                ? t('spot_detail.plates_hidden', { count: spot.platesHidden })
                : t('spot_detail.plates_none')
            }
            testID="spot-plates"
          />
        </Section>

        {showcase !== undefined && (
          <Section title={t('spot_detail.showcase_title')} testID="spot-owner-showcase">
            <ShowcaseRows showcase={showcase} />
          </Section>
        )}

        {isOwnSpot && spot.notes !== undefined && (
          <Section title={t('spot_detail.notes')} testID="spot-notes">
            <SectionText>
              <Text variant="value">{spot.notes}</Text>
            </SectionText>
          </Section>
        )}

        {isOwnSpot && (
          <StyledButton
            label={t('spot_detail.delete')}
            icon="trash"
            variant="text"
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
