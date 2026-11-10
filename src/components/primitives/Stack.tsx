import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { gapStyles, paddingStyles, type Align, type GapToken, type Justify } from './layout';

interface StackProps {
  children: ReactNode;
  gap?: GapToken;
  align?: Align;
  justify?: Justify;
  padding?: GapToken;
  flex?: number;
  wrap?: boolean;
  testID?: string;
}

/** Vertical layout with token gaps. */
export function Stack({
  children,
  gap = 'none',
  align = 'stretch',
  justify = 'flex-start',
  padding = 'none',
  flex,
  wrap = false,
  testID,
}: StackProps) {
  return (
    <View
      style={[
        styles.base,
        gapStyles[gap],
        paddingStyles[padding],
        { alignItems: align, justifyContent: justify },
        flex !== undefined && { flex },
        wrap && styles.wrap,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'column' },
  wrap: { flexWrap: 'wrap' },
});
