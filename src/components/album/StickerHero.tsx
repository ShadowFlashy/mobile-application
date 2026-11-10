import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { CATEGORY_ICONS } from '../../constants/carCategories';
import { borders, createThemedStyles, useTheme } from '../../theme';
import type { CarModel } from '../../types/CarModel';
import type { Spot } from '../../types/Spot';
import { pageIdOfModel } from '../../utils/album';
import { RarityBadge } from '../RarityBadge';
import { Tag } from '../primitives/Tag';
import { Text } from '../primitives/Text';
import { CarSilhouette } from './CarSilhouette';
import { FoilSticker } from './FoilSticker';
import { RarityPips } from './RarityPips';
import { useAlbumTitles } from './albumLabels';

export interface StickerHeroProps {
  model: CarModel;
  isCollected: boolean;
  /** The first collected spot (its photo is the album photo). */
  cover?: Spot;
  spotCount: number;
  testID?: string;
}

/**
 * The top of the sticker detail: the hero foil sticker (or the empty silhouette slot when locked),
 * "#07 · PORSCHE 911 GT3", and category, rarity, country and production-year chips.
 */
export function StickerHero({ model, isCollected, cover, spotCount, testID = 'sticker-hero' }: StickerHeroProps) {
  const { t } = useTranslation();
  const { finishes } = useTheme();
  const { countryLabel } = useAlbumTitles();
  const styles = useStyles();
  const car = `${model.make} ${model.model}`;
  const number = String(model.stickerNumber).padStart(2, '0');
  const isChase = !isCollected && model.rarity === 'legendary';
  const years =
    model.yearFrom === undefined
      ? undefined
      : model.yearTo !== undefined
        ? t('sticker_detail.years_range', { from: model.yearFrom, to: model.yearTo })
        : t('sticker_detail.years_since', { from: model.yearFrom });
  const stamp = spotCount > 1 ? 'count' : cover?.identifiedBy === 'ai' ? 'co_driver' : undefined;

  return (
    <View style={styles.hero} testID={testID}>
      <View style={styles.art}>
        {isCollected ? (
          <FoilSticker
            model={model}
            spot={cover}
            size="hero"
            stamp={stamp}
            count={spotCount}
            pageId={pageIdOfModel(model)}
            tiltSeed={model.id}
            testID="sticker-hero-foil"
          />
        ) : (
          <View
            style={[styles.well, isChase && { borderColor: finishes.legendary.edge[1], borderStyle: 'solid' }]}
            accessible
            accessibilityRole="image"
            accessibilityLabel={t('album.sticker_label_locked', {
              number: model.stickerNumber,
              car,
              rarity: t(`rarity.${model.rarity}`),
            })}
            testID="sticker-hero-locked"
          >
            <CarSilhouette bodyStyle={model.bodyStyle} size={220} tone="silhouette" />
            <RarityPips rarity={model.rarity} size="md" />
          </View>
        )}
      </View>
      <Text variant="display" heading testID="sticker-title">
        {t('sticker_detail.title_line', { number, car })}
      </Text>
      <View style={styles.chips}>
        <Tag label={t(`categories.${model.category}`)} icon={CATEGORY_ICONS[model.category]} />
        <RarityBadge rarity={model.rarity} />
        <Tag label={countryLabel(model.country)} icon="flag-outline" />
        {years !== undefined && <Tag label={years} icon="calendar-outline" />}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, spacing, radii }) => ({
  hero: { gap: spacing.md },
  art: { alignItems: 'center', paddingVertical: spacing.sm },
  well: {
    width: '100%',
    maxWidth: 300,
    aspectRatio: 4 / 3,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderRadius: radii.sticker,
    borderWidth: borders.strong,
    borderStyle: 'dashed',
    borderColor: colors.slotOutline,
    backgroundColor: colors.surfaceSunken,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
}));
