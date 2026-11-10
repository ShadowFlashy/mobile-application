import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { aspect, createThemedStyles, spacing } from '../../theme';
import type { CarModel } from '../../types/CarModel';
import type { Spot } from '../../types/Spot';
import { PhotoFrame } from '../primitives/PhotoFrame';
import { RarityRoundel } from '../primitives/RarityRoundel';
import { Text } from '../primitives/Text';
import { CarSilhouette } from './CarSilhouette';
import { stickerNo, useAlbumTitles } from './albumLabels';

export interface StickerHeroProps {
  model: CarModel;
  isCollected: boolean;
  /** The first collected spot (its photo is the album photo). */
  cover?: Spot;
  spotCount: number;
  testID?: string;
}

/**
 * The top of the sticker detail: the album photo at radius 8 on `raise` (or the body-style
 * silhouette while the sticker is missing), the number and car in big condensed type, and one
 * text-2 line with the tier, page, country and years.
 */
export function StickerHero({ model, isCollected, cover, testID = 'sticker-hero' }: StickerHeroProps) {
  const { t } = useTranslation();
  const { countryLabel, pageTitle } = useAlbumTitles();
  const styles = useStyles();
  const car = `${model.make} ${model.model}`;
  const number = stickerNo(model.stickerNumber);
  const years =
    model.yearFrom === undefined
      ? undefined
      : model.yearTo !== undefined
        ? t('sticker_detail.years_range', { from: model.yearFrom, to: model.yearTo })
        : t('sticker_detail.years_since', { from: model.yearFrom });
  const facts = [pageTitle(model.category), countryLabel(model.country), years].filter(Boolean).join(' · ');

  return (
    <View style={styles.hero} testID={testID}>
      {isCollected ? (
        <PhotoFrame
          uri={cover?.photoUrl}
          cacheKey={cover?.photoPath}
          accessibilityLabel={t('sticker_detail.photo_label', { car })}
          testID="sticker-hero-photo"
        />
      ) : (
        <View
          style={styles.locked}
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
        </View>
      )}
      <View style={styles.text}>
        <Text
          variant="title"
          heading
          accessibilityLabel={t('sticker_detail.title_label', { number: model.stickerNumber, car })}
          testID="sticker-title"
        >
          <Text variant="title" tone="text2">
            {'#'}
          </Text>
          {`${number} ${car}`}
        </Text>
        <View style={styles.facts}>
          <RarityRoundel rarity={model.rarity} showLabel />
          <Text variant="meta" tone="text2">
            {facts}
          </Text>
        </View>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  hero: { gap: spacing.md },
  locked: {
    width: '100%',
    aspectRatio: aspect.photo,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.raise,
  },
  text: { gap: spacing.sm },
  facts: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.smd, rowGap: spacing.xs },
}));
