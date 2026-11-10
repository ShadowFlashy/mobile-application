import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { createThemedStyles } from '../../theme';
import type { Spot } from '../../types/Spot';
import { compareByCreatedAt } from '../../utils/album';
import { formatDate } from '../../utils/formatDate';
import { PhotoFrame } from '../primitives/PhotoFrame';
import { PressableScale } from '../primitives/PressableScale';
import { Tag } from '../primitives/Tag';
import { Text } from '../primitives/Text';

export interface DuplicatesStripProps {
  /** Every spot of one model. Shown oldest first; the first one is the album photo. */
  spots: readonly Spot[];
  onPressSpot: (spot: Spot) => void;
  testID?: string;
}

/** A horizontal strip of every spot of a sticker, oldest first, the first marked FIRST. */
export function DuplicatesStrip({ spots, onPressSpot, testID = 'duplicates-strip' }: DuplicatesStripProps) {
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const ordered = [...spots].sort(compareByCreatedAt);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} testID={testID}>
      {ordered.map((spot, index) => {
        const date = formatDate(spot.spottedAt, i18n.language);
        return (
          <PressableScale
            key={spot.id}
            onPress={() => onPressSpot(spot)}
            accessibilityLabel={t('sticker_detail.spot_photo_label', { date })}
            testID={`duplicate-${spot.id}`}
          >
            <View style={styles.item}>
              <PhotoFrame
                uri={spot.photoUrl}
                cacheKey={spot.photoPath}
                radius="md"
                accessibilityLabel={t('sticker_detail.spot_photo_label', { date })}
                overlay={
                  index === 0 ? (
                    <View style={styles.badge}>
                      <Tag label={t('sticker_detail.first_spot')} tone="auto" />
                    </View>
                  ) : undefined
                }
              />
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {spot.city !== undefined ? `${date} · ${spot.city}` : date}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const useStyles = createThemedStyles(({ spacing }) => ({
  row: { gap: spacing.smd, paddingVertical: spacing.xs },
  item: { width: 144, gap: spacing.xs },
  badge: { position: 'absolute', top: spacing.xs, left: spacing.xs },
}));
