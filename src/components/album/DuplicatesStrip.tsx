import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import type { Spot } from '../../types/Spot';
import { compareByCreatedAt } from '../../utils/album';
import { formatDate } from '../../utils/formatDate';
import { TimingRow } from '../primitives/TimingRow';
import { CarThumb } from './CarThumb';

export interface DuplicatesStripProps {
  /** Every spot of one model. Shown oldest first; the first one is the album photo. */
  spots: readonly Spot[];
  onPressSpot: (spot: Spot) => void;
  testID?: string;
}

/**
 * Every spot of a sticker as timing-tower rows, oldest first: position, a 72 × 30 crop of the
 * photo, the date over the city, and "First" on the spot that is the album photo.
 */
export function DuplicatesStrip({ spots, onPressSpot, testID = 'duplicates-strip' }: DuplicatesStripProps) {
  const { t, i18n } = useTranslation();
  const ordered = [...spots].sort(compareByCreatedAt);
  return (
    <View testID={testID}>
      {ordered.map((spot, index) => {
        const date = formatDate(spot.spottedAt, i18n.language);
        const first = index === 0 ? t('sticker_detail.first_spot') : undefined;
        return (
          <TimingRow
            key={spot.id}
            number={String(index + 1)}
            hash={false}
            thumbnail={<CarThumb uri={spot.photoUrl} cacheKey={spot.photoPath} bodyStyle={spot.bodyStyle} />}
            title={date}
            subtitle={spot.city}
            meta={first}
            onPress={() => onPressSpot(spot)}
            accessibilityLabel={[t('sticker_detail.spot_photo_label', { date }), spot.city, first]
              .filter(Boolean)
              .join(', ')}
            testID={`duplicate-${spot.id}`}
          />
        );
      })}
    </View>
  );
}
