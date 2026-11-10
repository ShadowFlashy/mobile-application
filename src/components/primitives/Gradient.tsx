import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

export type GradientDirection = 'vertical' | 'horizontal' | 'diagonal';

interface GradientProps {
  /** Token arrays only (e.g. `finishes.rare.edge`, `[colors.scrimTop, colors.scrimBottom]`). */
  colors: readonly string[];
  /** Default `vertical`. */
  direction?: GradientDirection;
  /** Fills its parent absolutely, as an overlay that lets touches through. */
  fill?: boolean;
  children?: ReactNode;
  testID?: string;
}

const POINTS: Record<GradientDirection, { start: { x: number; y: number }; end: { x: number; y: number } }> = {
  vertical: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
  horizontal: { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
  diagonal: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
};

/** A linear gradient (expo-linear-gradient) between theme tokens. */
export function Gradient({ colors, direction = 'vertical', fill = false, children, testID }: GradientProps) {
  // LinearGradient needs at least two stops: a single token becomes a flat gradient.
  const [first = 'transparent', second = first, ...rest] = colors;
  const { start, end } = POINTS[direction];
  return (
    <LinearGradient
      colors={[first, second, ...rest]}
      start={start}
      end={end}
      style={fill ? StyleSheet.absoluteFill : undefined}
      pointerEvents={fill ? 'none' : 'auto'}
      testID={testID}
    >
      {children}
    </LinearGradient>
  );
}
