import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { borders, createThemedStyles, useTheme } from '../../theme';
import type { CarModel } from '../../types/CarModel';
import type { Spot } from '../../types/Spot';
import { PressableScale } from '../primitives/PressableScale';
import { Text } from '../primitives/Text';
import { CarSilhouette } from './CarSilhouette';
import { FoilSticker } from './FoilSticker';
import { RarityPips } from './RarityPips';

export type StickerSlotSize = 'sm' | 'md';

export interface StickerSlotProps {
  model: CarModel;
  isCollected: boolean;
  /** The first collected spot: its photo is on the sticker. */
  cover?: Spot;
  spotCount: number;
  /** An empty legendary slot gets a faint gold "chase" edge. Default: true for legendary models. */
  isChase?: boolean;
  onPress: () => void;
  /** = `sticker-<modelId>` */
  testID?: string;
  /** Default `md`; `sm` for the compact mini page of the reveal. */
  size?: StickerSlotSize;
  /** Rings the slot (the reveal's "stick it" target). */
  isHighlighted?: boolean;
}

/** Corner positions of the print crop marks around an empty slot. */
const CROP_MARKS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;

/**
 * One numbered album slot. Empty, it is a sunken well with a dashed cut line, print crop marks, the
 * silhouette of the body style, an outlined number, the make and model and the rarity pips.
 * Collected, the foil sticker sits in it (with a ×N stamp for duplicates).
 */
export function StickerSlot({
  model,
  isCollected,
  cover,
  spotCount,
  isChase,
  onPress,
  testID,
  size = 'md',
  isHighlighted = false,
}: StickerSlotProps) {
  const { t } = useTranslation();
  const { finishes } = useTheme();
  const styles = useStyles();
  const id = testID ?? `sticker-${model.id}`;
  const car = `${model.make} ${model.model}`;
  const chase = !isCollected && (isChase ?? model.rarity === 'legendary');
  const rarity = t(`rarity.${model.rarity}`);
  const label = isCollected
    ? t('album.sticker_label', { count: Math.max(1, spotCount), number: model.stickerNumber, car, rarity })
    : t(chase ? 'album.sticker_label_chase' : 'album.sticker_label_locked', {
        number: model.stickerNumber,
        car,
        rarity,
      });
  const isSmall = size === 'sm';

  return (
    <PressableScale onPress={onPress} accessibilityLabel={label} testID={id}>
      <View style={[styles.cell, isHighlighted && styles.highlight]}>
        {isCollected ? (
          <View testID={`${id}-collected`} style={styles.collected}>
            <FoilSticker
              model={model}
              spot={cover}
              size={isSmall ? 'sm' : 'md'}
              stamp={spotCount > 1 ? 'count' : undefined}
              count={spotCount}
              pageId={model.category}
              tiltSeed={model.id}
            />
          </View>
        ) : (
          <View
            style={[styles.well, chase && { borderColor: finishes.legendary.edge[1], borderStyle: 'solid' }]}
            testID={`${id}-locked`}
          >
            {CROP_MARKS.map((corner) => (
              <View key={corner} style={[styles.crop, styles[corner]]} />
            ))}
            {chase && (
              <View style={[styles.chaseGlow, { borderColor: finishes.legendary.edge[2] }]} testID={`${id}-chase`} />
            )}
            <View style={styles.art}>
              <CarSilhouette bodyStyle={model.bodyStyle} size={isSmall ? 64 : 112} tone="silhouette" />
              <View style={styles.number}>
                <Text variant="stickerNo" tone="subtle">
                  {`#${String(model.stickerNumber).padStart(2, '0')}`}
                </Text>
              </View>
            </View>
            <View style={styles.caption}>
              {!isSmall && (
                <Text variant="caption" tone="subtle" numberOfLines={1}>
                  {model.make}
                </Text>
              )}
              <Text variant={isSmall ? 'caption' : 'bodyStrong'} tone="muted" numberOfLines={1}>
                {isSmall ? car : model.model}
              </Text>
              <RarityPips rarity={model.rarity} size="sm" />
            </View>
          </View>
        )}
      </View>
    </PressableScale>
  );
}

const CROP = 10;

const useStyles = createThemedStyles(({ colors, spacing, radii }) => ({
  cell: { width: '100%', borderRadius: radii.sticker },
  highlight: { borderWidth: borders.focus, borderColor: colors.focusRing, padding: spacing.xxs },
  collected: { width: '100%' },
  well: {
    width: '100%',
    borderRadius: radii.sticker,
    backgroundColor: colors.surfaceSunken,
    borderWidth: borders.strong,
    borderStyle: 'dashed',
    borderColor: colors.slotOutline,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  chaseGlow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderRadius: radii.stickerInner,
    borderWidth: borders.hairline,
    opacity: 0.6,
  },
  crop: { position: 'absolute', width: CROP, height: CROP, borderColor: colors.borderStrong },
  topLeft: { top: -CROP / 2, left: -CROP / 2, borderTopWidth: 1, borderLeftWidth: 1 },
  topRight: { top: -CROP / 2, right: -CROP / 2, borderTopWidth: 1, borderRightWidth: 1 },
  bottomLeft: { bottom: -CROP / 2, left: -CROP / 2, borderBottomWidth: 1, borderLeftWidth: 1 },
  bottomRight: { bottom: -CROP / 2, right: -CROP / 2, borderBottomWidth: 1, borderRightWidth: 1 },
  number: {
    position: 'absolute',
    top: spacing.xxs,
    left: spacing.xxs,
    borderWidth: borders.hairline,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
  },
  art: { width: '100%', aspectRatio: 4 / 3, alignItems: 'center', justifyContent: 'center' },
  caption: { gap: spacing.xxs, paddingHorizontal: spacing.xs, paddingBottom: spacing.xs },
}));
