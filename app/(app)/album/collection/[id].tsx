import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlbumPage } from '../../../../src/components/album/AlbumPage';
import { AlbumSkeleton } from '../../../../src/components/album/AlbumSkeleton';
import { useAlbumTitles } from '../../../../src/components/album/albumLabels';
import { EmptyState } from '../../../../src/components/primitives/EmptyState';
import { Screen } from '../../../../src/components/primitives/Screen';
import { Stack as VStack } from '../../../../src/components/primitives/Stack';
import { Text } from '../../../../src/components/primitives/Text';
import { StyledButton } from '../../../../src/components/StyledButton';
import { routes } from '../../../../src/constants/routes';
import { useAlbum } from '../../../../src/hooks/useAlbum';
import type { CarModel } from '../../../../src/types/CarModel';
import { COLLECTION_IDS } from '../../../../src/types/Collection';
import { isCollectionId } from '../../../../src/utils/album';

/** A themed collection (Appendix E): its cars as an album page, with SET COMPLETE when it is full. */
export default function CollectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { collectionTitle } = useAlbumTitles();
  const { collectionById, isLoading, isRefreshing, refresh } = useAlbum();
  const collectionId = isCollectionId(id) ? id : undefined;
  const page = collectionId !== undefined ? collectionById(collectionId) : undefined;
  const openSticker = useCallback((model: CarModel) => router.push(routes.sticker(model.id)), []);
  const title = collectionId !== undefined ? collectionTitle(collectionId) : t('shell.collection_title');

  if (page === undefined) {
    return (
      <Screen testID="collection-screen">
        <Stack.Screen options={{ title }} />
        {isLoading && collectionId !== undefined ? (
          <AlbumSkeleton variant="page" />
        ) : (
          <EmptyState
            icon="albums-outline"
            title={t('album.collection_not_found_title')}
            description={t('album.collection_not_found_description')}
            action={<StyledButton label={t('album.back_to_album')} onPress={() => router.replace(routes.home)} />}
            testID="collection-not-found"
          />
        )}
      </Screen>
    );
  }

  const toGo = page.total - page.collected;
  return (
    <Screen testID="collection-screen" refreshing={isRefreshing} onRefresh={refresh}>
      <Stack.Screen options={{ title }} />
      <VStack gap="md">
        <AlbumPage page={page} onPressSlot={openSticker} />
        <Text
          variant="bodyStrong"
          tone={page.isComplete ? 'success' : 'muted'}
          align="center"
          testID="collection-status"
        >
          {page.isComplete ? t('album.set_complete_message') : t('album.set_to_go', { count: toGo })}
        </Text>
      </VStack>
    </Screen>
  );
}

/** Pre-renders every themed collection page in the static web export (Appendix E). */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return COLLECTION_IDS.map((id) => ({ id }));
}
