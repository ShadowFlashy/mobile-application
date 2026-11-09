import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View, type ListRenderItemInfo } from 'react-native';
import { CategoryFilter } from '../../../src/components/CategoryFilter';
import { CollectionProgress } from '../../../src/components/CollectionProgress';
import { EmptyState, Row, Screen, Skeleton, Stack, Text } from '../../../src/components/primitives';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { SpotCard } from '../../../src/components/SpotCard';
import { StickerCard } from '../../../src/components/StickerCard';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useStickerBook } from '../../../src/hooks/useStickerBook';
import { useAuthStore } from '../../../src/state/useAuthStore';
import { radii, spacing, useTheme } from '../../../src/theme';
import type { CarCategory } from '../../../src/types/CarModel';
import type { StickerSlot } from '../../../src/utils/collection';

/** Two stickers per row. A fixed width (not flex) keeps a lone last sticker the same size. */
const CELL_WIDTH = '48.5%';
const SKELETON_HEIGHT = 170;
const SKELETON_ROWS = ['first-row', 'second-row'];
/** Stable empty list: the grid shows skeletons until both the catalogue and the spots are loaded. */
const NO_SLOTS: StickerSlot[] = [];

/** Stable key per sticker: the id of its car model (course ch. 21). */
const keyExtractor = (slot: StickerSlot): string => slot.model.id;

/** Placeholders in the shape of the sticker grid while the sticker book loads. */
function StickerGridSkeleton() {
  return (
    <Stack gap="md" testID="collection-loading">
      {SKELETON_ROWS.map((row) => (
        <Row key={row} justify="space-between">
          <Skeleton width={CELL_WIDTH} height={SKELETON_HEIGHT} borderRadius={radii.md} />
          <Skeleton width={CELL_WIDTH} height={SKELETON_HEIGHT} borderRadius={radii.md} />
        </Row>
      ))}
    </Stack>
  );
}

export default function StickerBookScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const [category, setCategory] = useState<CarCategory>();
  const { slots, progress, overallProgress, otherSpots, totalSpots, isLoading, isRefreshing, isError, refresh } =
    useStickerBook(category);

  // Stable renderItem (course ch. 21): the stickers do not re-render every time the screen does.
  const renderSticker = useCallback(
    ({ item }: ListRenderItemInfo<StickerSlot>) => (
      <View style={styles.cell}>
        <StickerCard
          model={item.model}
          isCollected={item.isCollected}
          spotCount={item.spots.length}
          photoUrl={item.coverSpot?.photoUrl}
          photoPath={item.coverSpot?.photoPath}
          onPress={() => router.push(routes.sticker(item.model.id))}
        />
      </View>
    ),
    [],
  );

  const header = (
    <Stack gap="md">
      <ScreenHeader
        title={t('sticker_book.title')}
        subtitle={user !== undefined ? t('sticker_book.greeting', { name: user.name }) : undefined}
      />
      <CollectionProgress
        label={category === undefined ? t('sticker_book.all_stickers') : t(`categories.${category}`)}
        collected={progress.collected}
        total={progress.total}
      />
      <CategoryFilter selected={category} onSelect={setCategory} />
      {isError && (
        <Stack gap="sm">
          <Text color={colors.danger} testID="collection-error">
            {t('sticker_book.load_error')}
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
      {totalSpots === 0 && !isLoading && !isError && (
        <EmptyState
          icon="camera-outline"
          title={t('sticker_book.empty_title')}
          description={t('sticker_book.empty_description', { count: overallProgress.total })}
          action={
            <StyledButton label={t('sticker_book.spot_a_car')} icon="camera" onPress={() => router.push(routes.spot)} />
          }
          testID="empty-collection"
        />
      )}
    </Stack>
  );

  const footer =
    otherSpots.length > 0 && category === undefined ? (
      <Stack gap="sm">
        <Text size="lg" weight="bold" heading>
          {t('sticker_book.other_finds_title', { total: otherSpots.length })}
        </Text>
        <Text size="sm" color={colors.textMuted}>
          {t('sticker_book.other_finds_description')}
        </Text>
        {otherSpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} onPress={() => router.push(routes.spotDetail(spot.id))} />
        ))}
      </Stack>
    ) : undefined;

  // On a load error the message and retry button in the header replace the "no stickers" text.
  const noStickers = isError ? undefined : (
    <EmptyState title={t('sticker_book.no_stickers_in_category')} icon="albums-outline" />
  );

  return (
    <Screen padding="none" scrollable={false} testID="sticker-book-screen">
      <FlatList
        data={isLoading ? NO_SLOTS : slots}
        keyExtractor={keyExtractor}
        renderItem={renderSticker}
        numColumns={2}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.content}
        refreshing={isRefreshing}
        onRefresh={refresh}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={styles.header}
        ListFooterComponent={footer}
        ListFooterComponentStyle={styles.footer}
        ListEmptyComponent={isLoading ? <StickerGridSkeleton /> : noStickers}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  header: { marginBottom: spacing.xs },
  footer: { marginTop: spacing.md },
  columns: { justifyContent: 'space-between' },
  cell: { width: CELL_WIDTH },
});
