import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlbumIndex } from '../../../src/components/album/AlbumIndex';
import { AlbumSkeleton } from '../../../src/components/album/AlbumSkeleton';
import { AlbumTotals } from '../../../src/components/album/AlbumTotals';
import { LatestCatches } from '../../../src/components/album/LatestCatches';
import { WeekChallenges } from '../../../src/components/album/WeekChallenges';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { Screen } from '../../../src/components/primitives/Screen';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useAlbum } from '../../../src/hooks/useAlbum';
import { useProgress } from '../../../src/hooks/useProgress';
import type { CollectionId } from '../../../src/types/Collection';
import type { AlbumPageId } from '../../../src/types/Progress';
import type { Spot } from '../../../src/types/Spot';

/**
 * The Album tab (direction A): the "Album" header with the streak, the stickers and level
 * readouts, the latest catches as a timing tower, this week's challenges, and the Pages |
 * Collections index.
 */
export default function AlbumScreen() {
  const { t } = useTranslation();
  const album = useAlbum();
  const { snapshot } = useProgress();
  const { cover, pages, collections, slotByModelId, isLoading, isRefreshing, isError, refresh, totalSpots } = album;
  const streak = snapshot?.streak.current ?? 0;

  const modelOf = useCallback(
    (spot: Spot) => (spot.carModelId !== undefined ? slotByModelId(spot.carModelId)?.model : undefined),
    [slotByModelId],
  );
  const countOf = useCallback((modelId: string) => slotByModelId(modelId)?.spots.length ?? 0, [slotByModelId]);
  const openPage = useCallback((pageId: AlbumPageId) => router.push(routes.albumPage(pageId)), []);
  const openCollection = useCallback((id: CollectionId) => router.push(routes.albumCollection(id)), []);
  const openSpot = useCallback((spot: Spot) => router.push(routes.spotDetail(spot.id)), []);

  return (
    <Screen
      title={t('album.title')}
      meta={streak > 0 ? t('album.streak', { count: streak }) : undefined}
      testID="sticker-book-screen"
      refreshing={isRefreshing}
      onRefresh={refresh}
    >
      <Stack gap="lg">
        {isError && (
          <Stack gap="sm">
            <Text testID="collection-error">{t('album.load_error')}</Text>
            <StyledButton
              label={t('common.try_again')}
              icon="refresh"
              variant="secondary"
              onPress={refresh}
              isLoading={isRefreshing}
              testID="collection-retry-button"
            />
          </Stack>
        )}

        {isLoading ? (
          <AlbumSkeleton variant="cover" />
        ) : (
          <>
            <AlbumTotals cover={cover} level={snapshot?.level} />

            {totalSpots === 0 && !isError && (
              <EmptyState
                icon="camera"
                title={t('album.empty_title', { count: cover.total })}
                description={t('album.empty_description')}
                action={
                  <StyledButton
                    label={t('album.spot_a_car')}
                    icon="camera"
                    variant="primary"
                    onPress={() => router.push(routes.spot)}
                    testID="empty-spot-button"
                  />
                }
                testID="empty-collection"
              />
            )}

            {cover.latest.length > 0 && (
              <LatestCatches
                spots={cover.latest}
                modelOf={modelOf}
                collections={collections}
                countOf={countOf}
                onPressSpot={openSpot}
              />
            )}

            {snapshot !== undefined && snapshot.challenges.length > 0 && (
              <WeekChallenges challenges={snapshot.challenges} endsAt={snapshot.weekEndsAt} />
            )}

            <AlbumIndex
              pages={pages}
              collections={collections}
              onPressPage={openPage}
              onPressCollection={openCollection}
            />
          </>
        )}
      </Stack>
    </Screen>
  );
}
