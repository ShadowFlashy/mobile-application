import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { aspect, createThemedStyles, useMotion } from '../../theme';
import type { BodyStyle } from '../../types/CarModel';
import { CarSilhouette } from './CarSilhouette';

export interface CarThumbProps {
  /** The (redacted) photo; without it the body-style silhouette is drawn. */
  uri?: string;
  cacheKey?: string;
  bodyStyle: BodyStyle;
  testID?: string;
}

/** Width of A's timing-tower thumbnail; the height follows `aspect.thumb` (72 × 30). */
export const THUMB_WIDTH = 72;
const SILHOUETTE_WIDTH = 64;

/**
 * The 72 × 30 thumbnail of a timing-tower or sticker-table row: a crop of the photo, or the quiet
 * silhouette of the body style for a missing sticker. Decorative: the row carries the label.
 */
export function CarThumb({ uri, cacheKey, bodyStyle, testID }: CarThumbProps) {
  const styles = useStyles();
  // The photo fade is motion too: 0 ms with reduced motion.
  const { duration } = useMotion();
  return (
    <View
      style={styles.thumb}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID}
    >
      {uri !== undefined ? (
        <Image
          source={cacheKey !== undefined ? { uri, cacheKey } : { uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={duration('base')}
          accessible={false}
        />
      ) : (
        <CarSilhouette bodyStyle={bodyStyle} size={SILHOUETTE_WIDTH} tone="silhouette" />
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ radii }) => ({
  thumb: {
    width: THUMB_WIDTH,
    aspectRatio: aspect.thumb,
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: radii.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
