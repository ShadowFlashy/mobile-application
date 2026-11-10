import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import type { AlbumPageData } from '../../types/Album';
import type { CollectionId } from '../../types/Collection';
import type { AlbumPageId } from '../../types/Progress';
import type { CollectionPageData } from '../../utils/album';
import { Section } from '../primitives/Section';
import { SegmentedControl } from '../primitives/SegmentedControl';
import { PageTableRow } from './PageTableRow';
import { stickerNo, useAlbumTitles } from './albumLabels';

export type AlbumIndexTab = 'pages' | 'collections';

export interface AlbumIndexProps {
  /** The 9 album pages in print order. */
  pages: readonly AlbumPageData[];
  /** The themed collections (Appendix E) in set order; without them only the pages show. */
  collections: readonly CollectionPageData[];
  onPressPage: (pageId: AlbumPageId) => void;
  onPressCollection: (collectionId: CollectionId) => void;
  /** Default `pages`. */
  initialTab?: AlbumIndexTab;
  testID?: string;
}

/**
 * The album's index: "Pages | Collections" text tabs over a compact table (number, name, a short
 * 2 px line, count). Rows keep the `page-card-<id>` and `collection-card-<id>` testIDs.
 */
export function AlbumIndex({
  pages,
  collections,
  onPressPage,
  onPressCollection,
  initialTab = 'pages',
  testID = 'album-index',
}: AlbumIndexProps) {
  const { t } = useTranslation();
  const { pageTitle, collectionTitle } = useAlbumTitles();
  const hasCollections = collections.length > 0;
  const [tab, setTab] = useState<AlbumIndexTab>(initialTab);
  const active = hasCollections ? tab : 'pages';

  const pageRows = (
    <View testID="album-contents">
      {pages.map((page) => {
        const title = pageTitle(page.id);
        const isWildcards = page.id === 'wildcards';
        const label = isWildcards
          ? t('album.wildcards_row_label', { title, count: page.wildcards.length })
          : t('album.page_card_label', { number: page.number, title, collected: page.collected, total: page.total });
        return (
          <PageTableRow
            key={page.id}
            // Wildcards is not a catalogue page: no page number ("09" would suggest a ninth page).
            number={isWildcards ? '' : stickerNo(page.number)}
            title={title}
            count={
              isWildcards
                ? String(page.wildcards.length)
                : t('album.progress_count', { collected: page.collected, total: page.total })
            }
            progress={isWildcards || page.total === 0 ? undefined : page.collected / page.total}
            accessibilityLabel={label}
            onPress={() => onPressPage(page.id)}
            testID={`page-card-${page.id}`}
          />
        );
      })}
    </View>
  );

  const collectionRows = (
    <View testID="album-collections">
      {collections.map((set) => {
        const title = collectionTitle(set.collectionId);
        return (
          <PageTableRow
            key={set.collectionId}
            number={stickerNo(set.number)}
            title={title}
            count={t('album.progress_count', { collected: set.collected, total: set.total })}
            progress={set.total === 0 ? 0 : set.collected / set.total}
            accessibilityLabel={t('album.set_card_label', {
              number: set.number,
              title,
              collected: set.collected,
              total: set.total,
            })}
            onPress={() => onPressCollection(set.collectionId)}
            testID={`collection-card-${set.collectionId}`}
          />
        );
      })}
    </View>
  );

  if (!hasCollections) {
    return (
      <Section title={t('album.tab_pages')} testID={testID}>
        {pageRows}
      </Section>
    );
  }

  return (
    <View testID={testID}>
      <SegmentedControl
        role="tab"
        options={[
          { value: 'pages', label: t('album.tab_pages') },
          { value: 'collections', label: t('album.tab_collections') },
        ]}
        value={active}
        onChange={setTab}
        accessibilityLabel={t('album.index_label')}
        testID={`${testID}-tab`}
      />
      {active === 'pages' ? pageRows : collectionRows}
    </View>
  );
}
