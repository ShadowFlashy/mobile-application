import { View } from 'react-native';
import { contrastRatio, createThemedStyles, useTheme, type Livery, type Theme } from '../../theme';
import type { CollectionId } from '../../types/Collection';
import type { AlbumPageId } from '../../types/Progress';
import { Text } from '../primitives/Text';

export type LiveryStripeHeight = 'sm' | 'lg';

export interface LiveryStripeProps {
  /** The album page whose livery is painted (required unless `collectionId` is given). */
  pageId?: AlbumPageId;
  /** Appendix E: paints a themed collection's livery instead. */
  collectionId?: CollectionId;
  /** Already translated, e.g. "Supercars". Rendered uppercase. */
  label: string;
  height: LiveryStripeHeight;
  /** Printed page or set number ("03"). */
  number?: number;
  testID?: string;
}

/** The livery of a page or set (collections win; Wildcards is the default). */
export function liveryOf(theme: Theme, pageId?: AlbumPageId, collectionId?: CollectionId): Livery {
  if (collectionId !== undefined) return theme.collectionLiveries[collectionId];
  return theme.liveries[pageId ?? 'wildcards'];
}

/** The livery base, or its stripe when the base would vanish into a track (e.g. black on dark). */
export function visibleLiveryColor(livery: Livery, track: string): string {
  return (contrastRatio(livery.base, track) ?? 1) < 1.6 ? livery.stripe : livery.base;
}

const STRIPES = 3;

/**
 * The livery-striped header band of an album page: the page paint, racing stripes in the stripe
 * colour and the page title in condensed italic capitals.
 */
export function LiveryStripe({ pageId, collectionId, label, height, number, testID }: LiveryStripeProps) {
  const theme = useTheme();
  const styles = useStyles();
  const livery = liveryOf(theme, pageId, collectionId);
  const isLarge = height === 'lg';
  return (
    <View
      style={[styles.band, isLarge ? styles.large : styles.small, { backgroundColor: livery.base }]}
      accessibilityRole="header"
      testID={testID ?? `livery-${collectionId ?? pageId ?? 'wildcards'}`}
    >
      {number !== undefined && (
        <View style={[styles.number, { borderColor: livery.text }]}>
          <Text variant={isLarge ? 'numberSm' : 'stickerNo'} color={livery.text}>
            {String(number).padStart(2, '0')}
          </Text>
        </View>
      )}
      <View style={styles.label}>
        <Text variant={isLarge ? 'display' : 'title'} color={livery.text} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View style={styles.stripes} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {Array.from({ length: STRIPES }, (_, index) => (
          <View
            key={index}
            style={[
              styles.stripe,
              isLarge ? styles.stripeLarge : styles.stripeSmall,
              { backgroundColor: livery.stripe },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ spacing, radii }) => ({
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: radii.md,
    paddingLeft: spacing.md,
    gap: spacing.smd,
  },
  small: { minHeight: 48 },
  large: { minHeight: 72 },
  number: { borderWidth: 2, borderRadius: radii.sm, paddingHorizontal: spacing.xs },
  label: { flex: 1, minWidth: 0, paddingVertical: spacing.sm },
  stripes: { flexDirection: 'row', alignSelf: 'stretch', gap: spacing.xs, marginRight: -spacing.md },
  stripe: { transform: [{ skewX: '-20deg' }] },
  stripeSmall: { width: 8 },
  stripeLarge: { width: 12 },
}));
