import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { createThemedStyles, type SpacingToken } from '../../theme';
import { paddingStyles } from './layout';

/**
 * `flat` (default): no fill, no border, no radius, just grouping. `raise`: the one filled block A
 * allows (a photo backdrop, a disabled field), radius 8. `stage`: the always-dark photo stage.
 * Deprecated LIVERY variants: `raised` → flat, `sunken` → raise, `inverse` → raise.
 */
export type SurfaceVariant = 'flat' | 'raise' | 'stage' | 'raised' | 'sunken' | 'inverse';

interface SurfaceProps {
  children: ReactNode;
  /** Default `flat`. */
  variant?: SurfaceVariant;
  /** Default: none for flat, `md` (8) for raise and stage. LIVERY radii map to 8. */
  radius?: 'none' | 'md' | 'lg' | 'sticker';
  /** Default `none`. */
  padding?: SpacingToken;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

type Resolved = 'flat' | 'raise' | 'stage';

const RESOLVED: Record<SurfaceVariant, Resolved> = {
  flat: 'flat',
  raise: 'raise',
  stage: 'stage',
  raised: 'flat',
  sunken: 'raise',
  inverse: 'raise',
};

/** A flat block: no shadow and no nested cards; pressable (with a pressed fill) when onPress is set. */
export function Surface({
  children,
  variant = 'flat',
  radius,
  padding = 'none',
  onPress,
  accessibilityLabel,
  testID,
}: SurfaceProps) {
  const styles = useStyles();
  const resolved = RESOLVED[variant];
  const rounded = radius !== undefined ? radius !== 'none' : resolved !== 'flat';
  const base = [styles.base, styles[resolved], rounded && styles.rounded, paddingStyles[padding]];
  if (onPress === undefined) {
    return (
      <View style={base} testID={testID}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [...base, pressed && styles.pressed]}
      testID={testID}
    >
      {children}
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  base: { overflow: 'hidden' },
  flat: { backgroundColor: 'transparent' },
  raise: { backgroundColor: colors.raise },
  stage: { backgroundColor: colors.stage },
  rounded: { borderRadius: radii.md },
  pressed: { opacity: 0.7 },
}));
