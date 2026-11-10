import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { gapStyles, type Align, type GapToken, type Justify } from './layout';
import { ListRow, type ListRowProps } from './ListRow';

interface RowLayoutProps {
  children: ReactNode;
  gap?: GapToken;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  flex?: number;
  testID?: string;
  /** Layout rows have no title: pass `title` to get A's hairline list row instead. */
  title?: undefined;
}

/**
 * Two modes, picked by `title`:
 * - with `title`: A's hairline list row (40/44/56 pitch, leading, title and subtitle, trailing
 *   value, chevron, onPress with a 44 px target). Same props as `ListRow`.
 * - without: a horizontal layout of its children with token gaps ('flex-start' is the start of
 *   the reading direction, so rows are RTL-ready).
 */
export type RowProps = RowLayoutProps | ListRowProps;

export function Row(props: RowProps) {
  if (props.title !== undefined) return <ListRow {...props} />;
  return <LayoutRow {...props} />;
}

function LayoutRow({
  children,
  gap = 'none',
  align = 'center',
  justify = 'flex-start',
  wrap = false,
  flex,
  testID,
}: RowLayoutProps) {
  return (
    <View
      style={[
        styles.base,
        gapStyles[gap],
        { alignItems: align, justifyContent: justify },
        wrap && styles.wrap,
        flex !== undefined && { flex },
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row' },
  wrap: { flexWrap: 'wrap' },
});
