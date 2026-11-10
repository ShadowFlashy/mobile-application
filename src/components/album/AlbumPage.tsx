import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import type { AlbumSlotData } from '../../types/Album';
import type { CarModel } from '../../types/CarModel';
import type { Spot } from '../../types/Spot';
import { isCollectionPage, type AnyAlbumPage } from '../../utils/album';
import { EmptyState } from '../primitives/EmptyState';
import { ProgressBar } from '../primitives/ProgressBar';
import { ScreenTitle } from '../primitives/ScreenTitle';
import { Text } from '../primitives/Text';
import { TimingRow } from '../primitives/TimingRow';
import { CarThumb } from './CarThumb';
import { StickerRow } from './StickerRow';
import { stickerNo, useAlbumTitles, useDayLabel } from './albumLabels';

export interface AlbumPageProps {
  /** A category page, the Wildcards page or (Appendix E) a themed collection. Any number of slots (D-18). */
  page: AnyAlbumPage;
  /** Marks the row of this model. */
  highlightModelId?: string;
  /** Shows the page title in big condensed type with its page number (the pager has no header title). */
  showTitle?: boolean;
  onPressSlot?: (model: CarModel) => void;
  /** Opens a wildcard spot (Wildcards page only). */
  onPressSpot?: (spot: Spot) => void;
}

/**
 * One album page as a compact sticker table: a progress line ("2/17", or "Complete · 10/10" once
 * every sticker is in), then one hairline row per sticker in sticker-number order. The Wildcards
 * page lists every off-catalogue spot instead.
 */
export function AlbumPage({ page, highlightModelId, showTitle = false, onPressSlot, onPressSpot }: AlbumPageProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { titleOf } = useAlbumTitles();
  const dayLabel = useDayLabel();
  const isCollection = isCollectionPage(page);
  const isWildcards = !isCollection && page.id === 'wildcards';
  const wildcards = !isCollection ? page.wildcards : [];
  const title = titleOf(page);
  const testID = isCollection ? `collection-page-${page.collectionId}` : `album-page-${page.id}`;
  const count = t('album.progress_count', { collected: page.collected, total: page.total });

  const description = isCollection
    ? t(`collections.${page.collectionId}.description`)
    : isWildcards
      ? t('album.wildcards_description')
      : undefined;

  const summary = isWildcards ? (
    <Text variant="body" testID={`${testID}-count`}>
      {t('album.wildcards_count', { count: wildcards.length })}
    </Text>
  ) : (
    <View style={styles.summary}>
      <Text variant="body" testID={`${testID}-count`}>
        {page.isComplete ? t('album.complete', { collected: page.collected, total: page.total }) : count}
      </Text>
      {!page.isComplete && (
        <ProgressBar
          progress={page.total === 0 ? 0 : page.collected / page.total}
          label={t('album.progress_label', { title, collected: page.collected, total: page.total })}
        />
      )}
    </View>
  );

  const renderSlot = (slot: AlbumSlotData) => (
    <StickerRow
      key={slot.model.id}
      model={slot.model}
      isCollected={slot.isCollected}
      cover={slot.cover}
      spotCount={slot.spots.length}
      isHighlighted={slot.model.id === highlightModelId}
      onPress={onPressSlot !== undefined ? () => onPressSlot(slot.model) : undefined}
    />
  );

  const renderWildcard = (spot: Spot) => {
    const car = `${spot.make} ${spot.model}`;
    const when = dayLabel(spot.spottedAt);
    return (
      <TimingRow
        key={spot.id}
        number={t('album.no_number')}
        hash={false}
        thumbnail={<CarThumb uri={spot.photoUrl} cacheKey={spot.photoPath} bodyStyle={spot.bodyStyle} />}
        title={car}
        subtitle={spot.city}
        meta={when}
        onPress={onPressSpot !== undefined ? () => onPressSpot(spot) : undefined}
        accessibilityLabel={`${t('album.wildcard_label', { car })}, ${when}`}
        testID={`wildcard-${spot.id}`}
      />
    );
  };

  return (
    <View style={styles.page} testID={testID}>
      <View style={styles.head}>
        {showTitle && (
          <ScreenTitle
            title={title}
            meta={t(isCollection ? 'album.set_number' : 'album.page_number', { number: stickerNo(page.number) })}
            testID={`${testID}-title`}
          />
        )}
        {summary}
        {description !== undefined && (
          <Text variant="meta" tone="text2" testID={`${testID}-description`}>
            {description}
          </Text>
        )}
      </View>
      <View>{isWildcards ? wildcards.map(renderWildcard) : page.slots.map(renderSlot)}</View>

      {isWildcards && wildcards.length === 0 && (
        <EmptyState
          icon="help"
          title={t('album.wildcards_empty_title')}
          description={t('album.wildcards_empty_description')}
          testID="wildcards-empty"
        />
      )}
      {!isWildcards && page.slots.length === 0 && (
        <Text variant="value" tone="text2" testID={`${testID}-empty`}>
          {t('album.page_empty')}
        </Text>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  page: { gap: spacing.md },
  head: { gap: spacing.sm },
  summary: { gap: spacing.sm },
}));
