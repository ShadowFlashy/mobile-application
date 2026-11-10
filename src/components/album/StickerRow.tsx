import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { columns, createThemedStyles, lines, rowHeights, spacing } from '../../theme';
import type { CarModel } from '../../types/CarModel';
import type { Spot } from '../../types/Spot';
import { RarityRoundel } from '../primitives/RarityRoundel';
import { Text } from '../primitives/Text';
import { CarThumb } from './CarThumb';
import { stickerNo } from './albumLabels';

export interface StickerRowProps {
  model: CarModel;
  isCollected: boolean;
  /** The first collected spot: its photo is the thumbnail. */
  cover?: Spot;
  spotCount: number;
  onPress?: () => void;
  /** Marks the row (e.g. the car just added). */
  isHighlighted?: boolean;
  /** Default `sticker-<modelId>`. */
  testID?: string;
}

/** Width of the number column ("#118" in num). */

/**
 * One row of a sticker table: number, a 72 × 30 photo crop or silhouette, the car, and its rarity
 * roundel, on a 44 px hairline row. A missing sticker recedes to text-2 with the silhouette.
 */
export function StickerRow({
  model,
  isCollected,
  cover,
  spotCount,
  onPress,
  isHighlighted = false,
  testID,
}: StickerRowProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const id = testID ?? `sticker-${model.id}`;
  const car = `${model.make} ${model.model}`;
  const rarity = t(`rarity.${model.rarity}`);
  const tone = isCollected ? 'text' : 'text2';
  const label = isCollected
    ? t('album.sticker_label', { count: Math.max(1, spotCount), number: model.stickerNumber, car, rarity })
    : t('album.sticker_label_locked', { number: model.stickerNumber, car, rarity });

  return (
    <Pressable
      onPress={onPress}
      disabled={onPress === undefined}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, isHighlighted && styles.highlight, pressed && styles.pressed]}
      testID={id}
    >
      <View style={styles.number}>
        <Text variant="num" tone={tone} numberOfLines={1}>
          <Text variant="num" tone="text2">
            {'#'}
          </Text>
          {stickerNo(model.stickerNumber)}
        </Text>
      </View>
      <View testID={`${id}-${isCollected ? 'collected' : 'locked'}`}>
        <CarThumb
          uri={isCollected ? cover?.photoUrl : undefined}
          cacheKey={isCollected ? cover?.photoPath : undefined}
          bodyStyle={model.bodyStyle}
        />
      </View>
      <View style={styles.name}>
        <Text variant="body" tone={tone} numberOfLines={1}>
          {car}
          {spotCount > 1 && <Text variant="numS" tone="text2">{` ${t('album.times', { count: spotCount })}`}</Text>}
        </Text>
      </View>
      <RarityRoundel rarity={model.rarity} />
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    minHeight: rowHeights.default,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.xs,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  highlight: { borderBottomWidth: lines.underline, borderBottomColor: colors.text },
  pressed: { backgroundColor: colors.raise },
  number: { minWidth: columns.sticker, flexShrink: 0 },
  name: { flex: 1, minWidth: 0 },
}));
