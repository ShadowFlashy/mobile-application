import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { gapStyles, type Align, type GapToken, type Justify } from './layout';

interface RowProps {
  children: ReactNode;
  gap?: GapToken;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  flex?: number;
  testID?: string;
}

/** Horizontal layout; 'flex-start' is the start of the reading direction, so rows are RTL-ready. */
export function Row({
  children,
  gap = 'none',
  align = 'center',
  justify = 'flex-start',
  wrap = false,
  flex,
  testID,
}: RowProps) {
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
