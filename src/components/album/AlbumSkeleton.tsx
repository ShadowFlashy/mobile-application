import { View } from 'react-native';
import { createThemedStyles } from '../../theme';
import { Skeleton } from '../primitives/Skeleton';

export type AlbumSkeletonVariant = 'cover' | 'page';

export interface AlbumSkeletonProps {
  /** `cover`: the album cover plus contents; `page`: a stripe plus slots. */
  variant: AlbumSkeletonVariant;
  testID?: string;
}

const SLOTS = ['a', 'b', 'c', 'd'];

/** Loading placeholders in the shape of the album: a cover block and sticker-shaped slots. */
export function AlbumSkeleton({ variant, testID = 'collection-loading' }: AlbumSkeletonProps) {
  const styles = useStyles();
  return (
    <View
      style={styles.stack}
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Skeleton height={variant === 'cover' ? 220 : 72} shape="sticker" />
      <View style={styles.grid}>
        {SLOTS.map((slot) => (
          <View key={slot} style={styles.cell}>
            <Skeleton height={variant === 'cover' ? 150 : 210} shape="sticker" />
          </View>
        ))}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ spacing }) => ({
  stack: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.smd },
  cell: { width: '48.5%' },
}));
