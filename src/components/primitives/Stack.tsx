import { View, StyleSheet } from 'react-native';
import { spacing } from '../../theme';

interface StackProps {
  children: React.ReactNode;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  flex?: number;
  testID?: string;
}

export function Stack({
  children,
  gap = 'none',
  align = 'stretch',
  justify = 'flex-start',
  padding = 'none',
  flex,
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
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'column' },
});

const gapStyles = StyleSheet.create({
  none: { gap: spacing.none },
  xs: { gap: spacing.xs },
  sm: { gap: spacing.sm },
  md: { gap: spacing.md },
  lg: { gap: spacing.lg },
  xl: { gap: spacing.xl },
});

const paddingStyles = StyleSheet.create({
  none: { padding: spacing.none },
  sm: { padding: spacing.sm },
  md: { padding: spacing.md },
  lg: { padding: spacing.lg },
});
