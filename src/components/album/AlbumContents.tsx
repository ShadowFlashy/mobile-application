import { View } from 'react-native';
import { createThemedStyles } from '../../theme';
import type { AlbumPageData } from '../../types/Album';
import type { AlbumPageId } from '../../types/Progress';
import { PageIndexCard } from './PageIndexCard';
import { useAlbumTitles } from './albumLabels';

export interface AlbumContentsProps {
  /** The 9 album pages in print order. */
  pages: readonly AlbumPageData[];
  onPressPage: (pageId: AlbumPageId) => void;
  testID?: string;
}

/** The album's table of contents: a 2-column grid of page cards (8 categories and Wildcards). */
export function AlbumContents({ pages, onPressPage, testID = 'album-contents' }: AlbumContentsProps) {
  const styles = useStyles();
  const { pageTitle } = useAlbumTitles();
  return (
    <View style={styles.grid} testID={testID}>
      {pages.map((page) => (
        <View key={page.id} style={styles.cell}>
          <PageIndexCard
            title={pageTitle(page.id)}
            number={page.number}
            collected={page.collected}
            total={page.total}
            pageId={page.id}
            slots={page.slots.map((slot) => slot.isCollected)}
            wildcardCount={page.wildcards.length}
            onPress={() => onPressPage(page.id)}
          />
        </View>
      ))}
    </View>
  );
}

const useStyles = createThemedStyles(({ spacing }) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.smd },
  cell: { width: '48.5%' },
}));
