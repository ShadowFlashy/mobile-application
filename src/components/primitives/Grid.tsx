import { useMemo, type ReactElement } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { createThemedStyles, spacing, useTheme, type SpacingToken } from '../../theme';

export interface GridRenderInfo<T> {
  item: T;
  index: number;
}

interface GridProps<T> {
  data: readonly T[];
  columns: 2 | 3;
  renderItem: (info: GridRenderInfo<T>) => ReactElement | null;
  keyExtractor: (item: T, index: number) => string;
  /** Gutter between cells. Default `smd`. */
  gap?: SpacingToken;
  header?: ReactElement;
  footer?: ReactElement;
  /** Shown when data is empty. */
  empty?: ReactElement;
  refreshing?: boolean;
  onRefresh?: () => void;
  testID?: string;
}

type Cell<T> = { kind: 'item'; item: T; index: number; key: string } | { kind: 'spacer'; key: string };

/**
 * A virtualized grid (FlatList) with token gutters, so screens never touch FlatList styles. The
 * last row is padded with invisible spacers, so every cell has the same width.
 */
export function Grid<T>({
  data,
  columns,
  renderItem,
  keyExtractor,
  gap = 'smd',
  header,
  footer,
  empty,
  refreshing,
  onRefresh,
  testID,
}: GridProps<T>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const gutter = spacing[gap];

  const cells = useMemo((): Cell<T>[] => {
    const items: Cell<T>[] = data.map((item, index) => ({ kind: 'item', item, index, key: keyExtractor(item, index) }));
    const remainder = items.length % columns;
    if (remainder === 0) return items;
    const spacers: Cell<T>[] = Array.from({ length: columns - remainder }, (_, index) => ({
      kind: 'spacer',
      key: `__spacer-${index}`,
    }));
    return [...items, ...spacers];
  }, [data, columns, keyExtractor]);

  const renderCell = ({ item }: { item: Cell<T> }): ReactElement => (
    <View style={styles.cell}>{item.kind === 'item' ? renderItem({ item: item.item, index: item.index }) : null}</View>
  );

  return (
    <FlatList
      key={`grid-${columns}`}
      data={cells}
      numColumns={columns}
      renderItem={renderCell}
      keyExtractor={(cell) => cell.key}
      columnWrapperStyle={{ gap: gutter }}
      contentContainerStyle={[styles.content, { gap: gutter }]}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={empty}
      refreshControl={
        onRefresh !== undefined ? (
          <RefreshControl
            refreshing={refreshing === true}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      style={styles.list}
      testID={testID}
    />
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  list: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
  cell: { flex: 1, minWidth: 0 },
}));
