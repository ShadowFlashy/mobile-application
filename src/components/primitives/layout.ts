import { StyleSheet } from 'react-native';
import { spacing, type SpacingToken } from '../../theme';

/** Gap and padding styles per spacing token, shared by Stack, Row, Surface and Grid. */
export const gapStyles = StyleSheet.create({
  none: { gap: spacing.none },
  xxs: { gap: spacing.xxs },
  xs: { gap: spacing.xs },
  sm: { gap: spacing.sm },
  smd: { gap: spacing.smd },
  md: { gap: spacing.md },
  lg: { gap: spacing.lg },
  xl: { gap: spacing.xl },
  xxl: { gap: spacing.xxl },
});

export const paddingStyles = StyleSheet.create({
  none: { padding: spacing.none },
  xxs: { padding: spacing.xxs },
  xs: { padding: spacing.xs },
  sm: { padding: spacing.sm },
  smd: { padding: spacing.smd },
  md: { padding: spacing.md },
  lg: { padding: spacing.lg },
  xl: { padding: spacing.xl },
  xxl: { padding: spacing.xxl },
});

export type GapToken = SpacingToken;
export type Align = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
export type Justify = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
