import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import { Skeleton } from '../primitives/Skeleton';

export type AlbumSkeletonVariant = 'cover' | 'page';

export interface AlbumSkeletonProps {
  /** `cover`: the two readouts and the latest rows; `page`: a progress line and table rows. */
  variant: AlbumSkeletonVariant;
  testID?: string;
}

const ROWS = ['a', 'b', 'c', 'd', 'e'];

/** Loading placeholders in the shape of the album: readouts, then hairline-row sized blocks. */
export function AlbumSkeleton({ variant, testID = 'collection-loading' }: AlbumSkeletonProps) {
  const styles = useStyles();
  return (
    <View
      style={styles.stack}
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      {variant === 'cover' ? (
        <View style={styles.readouts}>
          <View style={styles.total}>
            <Skeleton height={112} />
          </View>
          <View style={styles.level}>
            <Skeleton height={72} />
          </View>
        </View>
      ) : (
        <Skeleton preset="line" width="40%" />
      )}
      <View style={styles.rows}>
        {ROWS.map((row) => (
          <Skeleton key={row} preset="line" />
        ))}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  stack: { gap: spacing.lg },
  readouts: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.lg },
  total: { flex: 9 },
  level: { flex: 5 },
  rows: { gap: spacing.xl },
}));
