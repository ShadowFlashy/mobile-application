import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { aspect, createThemedStyles, useMotion } from '../../theme';

interface PhotoFrameProps {
  uri?: string;
  /** Stable cache key (e.g. the storage path), so a re-signed URL is not downloaded again. */
  cacheKey?: string;
  /** Default 4/3. Fixed ratios keep the layout from shifting while photos load. */
  aspectRatio?: number;
  /** Default `cover`. */
  fit?: 'cover' | 'contain';
  overlay?: ReactNode;
  /** Default `md` (8). `none` for full-bleed photos. LIVERY radii map to 8. */
  radius?: 'none' | 'md' | 'lg' | 'stickerInner';
  accessibilityLabel: string;
  testID?: string;
}

/** A photo on the `raise` backdrop with radius 8, a fixed aspect ratio and a 200 ms fade-in. */
export function PhotoFrame({
  uri,
  cacheKey,
  aspectRatio = aspect.photo,
  fit = 'cover',
  overlay,
  radius = 'md',
  accessibilityLabel,
  testID,
}: PhotoFrameProps) {
  const styles = useStyles();
  // The photo fade is motion too: 0 ms with reduced motion.
  const { duration } = useMotion();
  return (
    <View
      style={[styles.frame, radius === 'none' ? styles.square : styles.rounded, { aspectRatio }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {uri !== undefined && (
        <Image
          source={cacheKey !== undefined ? { uri, cacheKey } : { uri }}
          style={StyleSheet.absoluteFill}
          contentFit={fit}
          transition={duration('base')}
          accessible={false}
        />
      )}
      {overlay !== undefined && <View style={StyleSheet.absoluteFill}>{overlay}</View>}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  frame: { width: '100%', overflow: 'hidden', backgroundColor: colors.raise },
  square: { borderRadius: radii.none },
  rounded: { borderRadius: radii.md },
}));
