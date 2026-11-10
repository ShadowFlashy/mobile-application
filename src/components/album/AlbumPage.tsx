import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, type LayoutChangeEvent } from 'react-native';
import { createThemedStyles, useTheme } from '../../theme';
import type { AlbumSlotData } from '../../types/Album';
import type { CarModel } from '../../types/CarModel';
import type { Spot } from '../../types/Spot';
import { isCollectionPage, slotRect, SLOT_GUTTER_RATIO, type AnyAlbumPage } from '../../utils/album';
import { EmptyState } from '../primitives/EmptyState';
import { ProgressBar } from '../primitives/ProgressBar';
import { Text } from '../primitives/Text';
import { FoilSticker } from './FoilSticker';
import { LiveryStripe, liveryOf, visibleLiveryColor } from './LiveryStripe';
import { useAlbumTitles } from './albumLabels';
import { SetCompleteStamp } from './SetCompleteStamp';
import { StampBadge } from './StampBadge';
import { StickerSlot } from './StickerSlot';

export interface AlbumPageProps {
  /** A category page, the Wildcards page or (Appendix E) a themed collection. Any number of slots (D-18). */
  page: AnyAlbumPage;
  highlightModelId?: string;
  /** Mini page for the reveal: 3 columns, small slots, no description. */
  compact?: boolean;
  onPressSlot?: (model: CarModel) => void;
  /** Opens a wildcard spot (Wildcards page only). */
  onPressSpot?: (spot: Spot) => void;
}

/**
 * One album page: a livery stripe header, the page progress with its FULL PAGE / SET COMPLETE
 * stamp, and a grid of slots in sticker-number order. The Wildcards page lists every off-catalogue
 * spot as a matte WILDCARD sticker instead.
 */
export function AlbumPage({ page, highlightModelId, compact = false, onPressSlot, onPressSpot }: AlbumPageProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();
  const { titleOf } = useAlbumTitles();
  const [width, setWidth] = useState(0);
  const columns = compact ? 3 : 2;
  const isCollection = isCollectionPage(page);
  const collectionId = isCollection ? page.collectionId : undefined;
  const pageId = isCollection ? undefined : page.id;
  const title = titleOf(page);
  const livery = liveryOf(theme, pageId, collectionId);
  const isWildcards = pageId === 'wildcards';
  const wildcards = !isCollection ? page.wildcards : [];
  const testID = isCollection ? `collection-page-${page.collectionId}` : `album-page-${page.id}`;

  const cellWidth = width > 0 ? slotRect(0, width, columns).width : undefined;
  const gutter = width * SLOT_GUTTER_RATIO;
  const cellStyle = cellWidth !== undefined ? { width: cellWidth } : compact ? styles.cellThird : styles.cellHalf;
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const renderSlot = (slot: AlbumSlotData) => (
    <View key={slot.model.id} style={cellStyle}>
      <StickerSlot
        model={slot.model}
        isCollected={slot.isCollected}
        cover={slot.cover}
        spotCount={slot.spots.length}
        size={compact ? 'sm' : 'md'}
        isHighlighted={slot.model.id === highlightModelId}
        onPress={() => onPressSlot?.(slot.model)}
      />
    </View>
  );

  const renderWildcard = (spot: Spot) => (
    <View key={spot.id} style={cellStyle}>
      <FoilSticker
        spot={spot}
        size={compact ? 'sm' : 'md'}
        stamp="wildcard"
        pageId="wildcards"
        tiltSeed={spot.id}
        onPress={onPressSpot !== undefined ? () => onPressSpot(spot) : undefined}
        testID={`wildcard-${spot.id}`}
      />
    </View>
  );

  const description = isCollection
    ? t(`collections.${page.collectionId}.description`)
    : isWildcards
      ? t('album.wildcards_description')
      : undefined;

  return (
    <View style={compact ? styles.pageCompact : styles.page} testID={testID}>
      <LiveryStripe
        pageId={pageId}
        collectionId={collectionId}
        label={title}
        height={compact ? 'sm' : 'lg'}
        number={page.number}
      />
      {!compact && description !== undefined && (
        <Text variant="bodySm" tone="muted" testID={`${testID}-description`}>
          {description}
        </Text>
      )}
      {isWildcards ? (
        <Text variant="label" tone="muted" testID={`${testID}-count`}>
          {t('album.wildcards_count', { count: wildcards.length })}
        </Text>
      ) : (
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <ProgressBar
              progress={page.total === 0 ? 0 : page.collected / page.total}
              label={t('album.progress_label', { title, collected: page.collected, total: page.total })}
              tone="livery"
              liveryColor={visibleLiveryColor(livery, theme.colors.surfaceSunken)}
              height={8}
            />
          </View>
          <Text variant="numberSm" testID={`${testID}-count`}>
            {t('album.progress_count', { collected: page.collected, total: page.total })}
          </Text>
          {!isCollection && page.isComplete && <StampBadge kind="full_page" size={compact ? 'sm' : 'md'} />}
        </View>
      )}
      {isCollection && page.isComplete && (
        <SetCompleteStamp collectionId={page.collectionId} size={compact ? 'sm' : 'lg'} />
      )}

      <View style={[styles.grid, { gap: gutter }]} onLayout={onLayout}>
        {isWildcards ? wildcards.map(renderWildcard) : page.slots.map(renderSlot)}
      </View>

      {isWildcards && wildcards.length === 0 && (
        <EmptyState
          icon="help-circle-outline"
          title={t('album.wildcards_empty_title')}
          description={t('album.wildcards_empty_description')}
          testID="wildcards-empty"
        />
      )}
      {!isWildcards && page.slots.length === 0 && (
        <Text variant="bodySm" tone="subtle" align="center" testID={`${testID}-empty`}>
          {t('album.page_empty')}
        </Text>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ spacing }) => ({
  page: { gap: spacing.md },
  pageCompact: { gap: spacing.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.smd },
  progressBar: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
  cellHalf: { width: '48%' },
  cellThird: { width: '31%' },
}));
