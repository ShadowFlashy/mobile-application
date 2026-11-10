import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlbumContents } from '../../../src/components/album/AlbumContents';
import { AlbumCover } from '../../../src/components/album/AlbumCover';
import { AlbumSkeleton } from '../../../src/components/album/AlbumSkeleton';
import { CollectionShelf } from '../../../src/components/album/CollectionShelf';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { Screen } from '../../../src/components/primitives/Screen';
import { Section } from '../../../src/components/primitives/Section';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useAlbum } from '../../../src/hooks/useAlbum';
import { useProgress } from '../../../src/hooks/useProgress';
import { useAuthStore } from '../../../src/state/useAuthStore';
import type { CollectionId } from '../../../src/types/Collection';
import type { AlbumPageId } from '../../../src/types/Progress';
import type { Spot } from '../../../src/types/Spot';

/** The Album tab: the album cover, the contents (9 pages) and the themed collections shelf. */
export default function AlbumScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const album = useAlbum();
  const { snapshot } = useProgress();
  const { cover, pages, collections, slotByModelId, isLoading, isRefreshing, isError, refresh, totalSpots } = album;

  const mainChallenge = snapshot?.challenges.find((progress) => progress.challenge.slot === 'main');
  const modelOf = useCallback(
    (spot: Spot) => (spot.carModelId !== undefined ? slotByModelId(spot.carModelId)?.model : undefined),
    [slotByModelId],
  );
  const openPage = useCallback((pageId: AlbumPageId) => router.push(routes.albumPage(pageId)), []);
  const openCollection = useCallback((id: CollectionId) => router.push(routes.albumCollection(id)), []);
  const openSpot = useCallback((spot: Spot) => router.push(routes.spotDetail(spot.id)), []);

  return (
    <Screen testID="sticker-book-screen" refreshing={isRefreshing} onRefresh={refresh}>
      <Stack gap="lg">
        <ScreenHeader
          title={t('album.title')}
          subtitle={user !== undefined ? t('album.greeting', { name: user.name }) : undefined}
        />

        {isError && (
          <Stack gap="sm">
            <Text tone="danger" testID="collection-error">
              {t('album.load_error')}
            </Text>
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
            <AlbumCover
              cover={cover}
              level={snapshot?.level.level}
              challenge={mainChallenge}
              weekEndsAt={snapshot?.weekEndsAt}
              modelOf={modelOf}
              onPressLatest={openSpot}
            />

            {totalSpots === 0 && !isError && (
              <EmptyState
                icon="camera-outline"
                title={t('album.empty_title', { count: cover.total })}
                description={t('album.empty_description')}
                action={
                  <StyledButton
                    label={t('album.spot_a_car')}
                    icon="camera"
                    variant="ignition"
                    onPress={() => router.push(routes.spot)}
                    testID="empty-spot-button"
                  />
                }
                testID="empty-collection"
              />
            )}

            <Section title={t('album.contents_title')} testID="album-contents-section">
              <AlbumContents pages={pages} onPressPage={openPage} />
            </Section>

            {collections.length > 0 && (
              <Section title={t('album.collections_title')} testID="album-collections-section">
                <Text variant="bodySm" tone="muted">
                  {t('album.collections_subtitle')}
                </Text>
                <CollectionShelf collections={collections} onPressCollection={openCollection} />
              </Section>
            )}
          </>
        )}
      </Stack>
    </Screen>
  );
}
