import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { createThemedStyles } from '../../theme';
import type { AlbumPageData } from '../../types/Album';
import type { CarModel } from '../../types/CarModel';
import type { AlbumPageId } from '../../types/Progress';
import type { Spot } from '../../types/Spot';
import { IconButton } from '../primitives/IconButton';
import { Text } from '../primitives/Text';
import { AlbumPage } from './AlbumPage';

export interface AlbumPagerProps {
  /** The album pages in print order. */
  pages: readonly AlbumPageData[];
  /** The page the pager opens at (from the URL). */
  initialPageId: AlbumPageId;
  /** Called when the user swipes or steps to another page. */
  onPageChange?: (pageId: AlbumPageId) => void;
  onPressSlot?: (model: CarModel) => void;
  onPressSpot?: (spot: Spot) => void;
  testID?: string;
}

const keyExtractor = (page: AlbumPageData): string => page.id;

/**
 * Swipeable album pages: a horizontal paging list opened at the URL page. Previous/next buttons
 * and a "03/09" position make it usable without swiping (keyboard, screen readers, desktop).
 */
export function AlbumPager({
  pages,
  initialPageId,
  onPageChange,
  onPressSlot,
  onPressSpot,
  testID = 'album-pager',
}: AlbumPagerProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const listRef = useRef<FlatList<AlbumPageData>>(null);
  const initialIndex = Math.max(
    0,
    pages.findIndex((page) => page.id === initialPageId),
  );
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [index, setIndex] = useState(initialIndex);
  const indexRef = useRef(initialIndex);

  // Each page gets the measured width AND height of the list area, so its own vertical ScrollView
  // scrolls. Without a height a page grew to its full content height and the horizontal list
  // clipped it on the web, so long pages (05 Classics, 06 JDM) could not be scrolled.
  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    setSize((current) =>
      current.width === nextWidth && current.height === nextHeight ? current : { width: nextWidth, height: nextHeight },
    );
  };
  const { width, height } = size;

  const settle = useCallback(
    (next: number) => {
      const clamped = Math.min(pages.length - 1, Math.max(0, next));
      if (indexRef.current === clamped) return;
      indexRef.current = clamped;
      setIndex(clamped);
      const page = pages[clamped];
      if (page !== undefined) onPageChange?.(page.id);
    },
    [pages, onPageChange],
  );

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    settle(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  // The buttons jump without animation: on the web a smooth scroll inside a snapping list can be
  // cancelled by the re-render that follows, leaving the list on the old page.
  const goTo = (next: number) => {
    const clamped = Math.min(pages.length - 1, Math.max(0, next));
    if (clamped === indexRef.current) return;
    listRef.current?.scrollToIndex({ index: clamped, animated: false });
    settle(clamped);
  };

  const renderPage = ({ item }: ListRenderItemInfo<AlbumPageData>) => (
    <View style={{ width, height }}>
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} testID={`pager-page-${item.id}`}>
        <AlbumPage page={item} onPressSlot={onPressSlot} onPressSpot={onPressSpot} />
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.root} testID={testID}>
      <View style={styles.listArea} onLayout={onLayout} testID={`${testID}-area`}>
        {width > 0 && height > 0 && (
          <FlatList
            ref={listRef}
            data={pages}
            keyExtractor={keyExtractor}
            renderItem={renderPage}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, itemIndex) => ({ length: width, offset: width * itemIndex, index: itemIndex })}
            onScroll={onScroll}
            scrollEventThrottle={32}
            initialNumToRender={1}
            windowSize={3}
            style={styles.list}
            extraData={size}
          />
        )}
      </View>
      <View style={styles.footer}>
        <IconButton
          icon="chevron-back"
          label={t('album.previous_page')}
          onPress={() => goTo(index - 1)}
          disabled={index === 0}
          testID="pager-previous"
        />
        <View
          accessible
          accessibilityLabel={t('album.pager_label', { current: index + 1, total: pages.length })}
          accessibilityLiveRegion="polite"
        >
          <Text variant="numberSm" testID="pager-position">
            {t('album.pager_position', {
              current: String(index + 1).padStart(2, '0'),
              total: String(pages.length).padStart(2, '0'),
            })}
          </Text>
        </View>
        <IconButton
          icon="chevron-forward"
          label={t('album.next_page')}
          onPress={() => goTo(index + 1)}
          disabled={index >= pages.length - 1}
          testID="pager-next"
        />
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, spacing }) => ({
  root: { flex: 1, backgroundColor: colors.background },
  // minHeight 0 lets the list area shrink to the space above the footer; without it the first
  // (too tall) measurement props it up and the last row of a long page hides behind the footer.
  listArea: { flex: 1, minHeight: 0 },
  list: { flex: 1 },
  page: { flex: 1 },
  pageContent: { padding: spacing.md, paddingBottom: spacing.xl },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
}));
