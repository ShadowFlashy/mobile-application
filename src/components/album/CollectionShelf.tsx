import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { createThemedStyles } from '../../theme';
import type { CollectionId } from '../../types/Collection';
import type { CollectionPageData } from '../../utils/album';
import { PageIndexCard } from './PageIndexCard';
import { useAlbumTitles } from './albumLabels';

export interface CollectionShelfProps {
  /** The themed collections (Appendix E) in set order. */
  collections: readonly CollectionPageData[];
  onPressCollection: (collectionId: CollectionId) => void;
  testID?: string;
}

/** A horizontally scrolling shelf of themed collections, each a set card with its progress. */
export function CollectionShelf({
  collections,
  onPressCollection,
  testID = 'collections-shelf',
}: CollectionShelfProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { collectionTitle } = useAlbumTitles();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroller}
      testID={testID}
    >
      {collections.map((page) => (
        <View key={page.collectionId}>
          <PageIndexCard
            variant="shelf"
            title={collectionTitle(page.collectionId)}
            description={t(`collections.${page.collectionId}.description`)}
            number={page.number}
            collected={page.collected}
            total={page.total}
            collectionId={page.collectionId}
            slots={page.slots.map((slot) => slot.isCollected)}
            onPress={() => onPressCollection(page.collectionId)}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const useStyles = createThemedStyles(({ spacing }) => ({
  scroller: { marginHorizontal: -spacing.md },
  row: { gap: spacing.smd, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
}));
