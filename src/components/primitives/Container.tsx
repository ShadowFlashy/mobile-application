import { View, StyleSheet } from 'react-native';
import { spacing } from '../../theme';

interface ContainerProps {
  children: React.ReactNode;
  flex?: number;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Container({ children, flex, padding = 'none' }: ContainerProps) {
  return <View style={[styles.base, flex !== undefined && { flex }, styles[padding]]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  none: { padding: spacing.none },
  sm: { padding: spacing.sm },
  md: { padding: spacing.md },
  lg: { padding: spacing.lg },
});
