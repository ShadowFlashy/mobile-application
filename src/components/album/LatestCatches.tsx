import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CarModel } from '../../types/CarModel';
import type { Spot } from '../../types/Spot';
import { collectionsOfModel, type CollectionPageData } from '../../utils/album';
import { Section } from '../primitives/Section';
import { TimingRow } from '../primitives/TimingRow';
import { StyledButton } from '../StyledButton';
import { CarThumb } from './CarThumb';
import { stickerNo, useAlbumTitles, useDayLabel } from './albumLabels';

export interface LatestCatchesProps {
  /** The newest catches, newest first. */
  spots: readonly Spot[];
  /** The catalogue model of a catch (undefined = a wildcard). */
  modelOf: (spot: Spot) => CarModel | undefined;
  /** The themed collections: a catch's set is the first one its model belongs to. */
  collections: readonly CollectionPageData[];
  /** How many spots the user has of a model (for "×3"). */
  countOf?: (modelId: string) => number;
  onPressSpot: (spot: Spot) => void;
  /** Rows shown before "See all". Default 3. */
  initialCount?: number;
  testID?: string;
}

/**
 * "Latest" as a timing tower: #number, a 72 × 30 crop of the photo, the car over its set, and the
 * day over the rarity roundel. "See all" unfolds the rest of the newest catches in place.
 */
export function LatestCatches({
  spots,
  modelOf,
  collections,
  countOf,
  onPressSpot,
  initialCount = 3,
  testID = 'album-latest',
}: LatestCatchesProps) {
  const { t } = useTranslation();
  const { pageTitle, collectionTitle } = useAlbumTitles();
  const dayLabel = useDayLabel();
  const [expanded, setExpanded] = useState(false);
  const canExpand = spots.length > initialCount;
  const visible = expanded ? spots : spots.slice(0, initialCount);

  const action = canExpand ? (
    <StyledButton
      variant="text"
      label={expanded ? t('album.show_less') : t('common.see_all')}
      onPress={() => setExpanded((value) => !value)}
      testID={`${testID}-see-all`}
    />
  ) : undefined;

  return (
    <Section title={t('album.latest')} action={action} testID={testID}>
      {visible.map((spot) => {
        const model = modelOf(spot);
        const car = model !== undefined ? `${model.make} ${model.model}` : `${spot.make} ${spot.model}`;
        const when = dayLabel(spot.spottedAt);
        const set =
          model === undefined
            ? t('album.wildcards_title')
            : (() => {
                const first = collectionsOfModel(collections, model.id)[0];
                return first !== undefined ? collectionTitle(first.collectionId) : pageTitle(model.category);
              })();
        const count = model !== undefined && countOf !== undefined ? countOf(model.id) : 1;
        return (
          <TimingRow
            key={spot.id}
            number={model !== undefined ? stickerNo(model.stickerNumber) : t('album.no_number')}
            hash={model !== undefined}
            thumbnail={
              <CarThumb uri={spot.photoUrl} cacheKey={spot.photoPath} bodyStyle={model?.bodyStyle ?? spot.bodyStyle} />
            }
            title={car}
            titleSuffix={count > 1 ? t('album.times', { count }) : undefined}
            subtitle={set}
            meta={when}
            rarity={model?.rarity}
            onPress={() => onPressSpot(spot)}
            accessibilityLabel={
              model !== undefined
                ? t('album.latest_label', {
                    number: model.stickerNumber,
                    car,
                    set,
                    when,
                    rarity: t(`rarity.${model.rarity}`),
                  })
                : `${t('album.wildcard_label', { car })}, ${when}`
            }
            testID={`latest-${spot.id}`}
          />
        );
      })}
    </Section>
  );
}
