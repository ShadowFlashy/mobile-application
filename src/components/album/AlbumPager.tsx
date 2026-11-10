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
import { createThemedStyles, lines, spacing } from '../../theme';
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

interface Size {
  width: number;
  height: number;
}

const keyExtractor = (page: AlbumPageData): string => page.id;

/**
 * Swipeable album pages: a horizontal paging list opened at the URL page, with a plain footer of
 * previous / "03/09" / next (usable without swiping: keyboard, screen readers, desktop).
 *
 * Each page gets the measured width AND height of the list area, so its own vertical ScrollView
 * is the scroller. Without the height, a page grew to its full content height and the horizontal
 * list clipped the rows below the fold on the web.
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
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [index, setIndex] = useState(initialIndex);
  const indexRef = useRef(initialIndex);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    const height = Math.round(event.nativeEvent.layout.height);
    setSize((current) => (current.width === width && current.height === height ? current : { width, height }));
  };

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
    if (size.width === 0) return;
    settle(Math.round(event.nativeEvent.contentOffset.x / size.width));
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
    <View style={{ width: size.width, height: size.height }}>
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} testID={`pager-page-${item.id}`}>
        <AlbumPage page={item} showTitle onPressSlot={onPressSlot} onPressSpot={onPressSpot} />
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.root} testID={testID}>
      <View style={styles.listArea} onLayout={onLayout}>
        {size.width > 0 && size.height > 0 && (
          <FlatList
            ref={listRef}
            data={pages}
            keyExtractor={keyExtractor}
            renderItem={renderPage}
            extraData={size}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, itemIndex) => ({
              length: size.width,
              offset: size.width * itemIndex,
              index: itemIndex,
            })}
            onScroll={onScroll}
            scrollEventThrottle={32}
            initialNumToRender={1}
            windowSize={3}
            style={styles.list}
          />
        )}
      </View>
      <View style={styles.footer}>
        <IconButton
          icon="chevron-left"
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
          <Text variant="num" testID="pager-position">
            {String(index + 1).padStart(2, '0')}
            <Text variant="num" tone="text2">
              {t('album.pager_total', { total: String(pages.length).padStart(2, '0') })}
            </Text>
          </Text>
        </View>
        <IconButton
          icon="chevron-right"
          label={t('album.next_page')}
          onPress={() => goTo(index + 1)}
          disabled={index >= pages.length - 1}
          testID="pager-next"
        />
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  root: { flex: 1, backgroundColor: colors.bg },
  listArea: { flex: 1, minHeight: 0 },
  list: { flex: 1 },
  page: { flex: 1 },
  pageContent: { paddingHorizontal: spacing.gutter, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    borderTopWidth: lines.hairline,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
}));
