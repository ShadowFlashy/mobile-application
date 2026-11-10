import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlbumPager } from '../../../src/components/album/AlbumPager';
import { AlbumSkeleton } from '../../../src/components/album/AlbumSkeleton';
import { useAlbumTitles } from '../../../src/components/album/albumLabels';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { Screen } from '../../../src/components/primitives/Screen';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useAlbum } from '../../../src/hooks/useAlbum';
import type { CarModel } from '../../../src/types/CarModel';
import { ALBUM_PAGE_IDS, type AlbumPageId } from '../../../src/types/Progress';
import type { Spot } from '../../../src/types/Spot';
import { isAlbumPageId } from '../../../src/utils/typeGuards';

/** One album page (a sticker table) in a swipeable pager over all 9 pages, opened at the page in the URL. */
export default function AlbumPageScreen() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const { t } = useTranslation();
  const { pageTitle } = useAlbumTitles();
  const { pages, isLoading } = useAlbum();
  const initialPageId = isAlbumPageId(page) ? page : undefined;
  const [currentPageId, setCurrentPageId] = useState<AlbumPageId | undefined>(initialPageId);

  const onPageChange = useCallback((pageId: AlbumPageId) => {
    setCurrentPageId(pageId);
    // Keep the URL on the visible page, so a refresh or a shared link opens the same page.
    router.setParams({ page: pageId });
  }, []);
  const openSticker = useCallback((model: CarModel) => router.push(routes.sticker(model.id)), []);
  const openSpot = useCallback((spot: Spot) => router.push(routes.spotDetail(spot.id)), []);

  if (initialPageId === undefined) {
    return (
      <Screen testID="album-page-screen">
        <Stack.Screen options={{ title: t('shell.album_title') }} />
        <EmptyState
          icon="album"
          title={t('album.not_found_title')}
          description={t('album.not_found_description')}
          action={<StyledButton label={t('album.back_to_album')} onPress={() => router.replace(routes.home)} />}
          testID="album-page-not-found"
        />
      </Screen>
    );
  }

  return (
    <Screen scrollable={false} padding="none" testID="album-page-screen">
      {/* Each page shows its own big title, so the bar keeps only the back button. */}
      <Stack.Screen options={{ title: pageTitle(currentPageId ?? initialPageId), headerTitle: '' }} />
      {isLoading ? (
        <AlbumSkeleton variant="page" />
      ) : (
        <AlbumPager
          pages={pages}
          initialPageId={initialPageId}
          onPageChange={onPageChange}
          onPressSlot={openSticker}
          onPressSpot={openSpot}
        />
      )}
    </Screen>
  );
}

/** Pre-renders every album page in the static web export (9 pages). */
export async function generateStaticParams(): Promise<{ page: string }[]> {
  return ALBUM_PAGE_IDS.map((page) => ({ page }));
}
