import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { createThemedStyles, radii, spacing, useTheme } from '../theme';
import type { CarModel } from '../types/CarModel';
import { Card } from './primitives/Card';
import { Icon } from './primitives/Icon';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';
import { RarityBadge } from './RarityBadge';

interface StickerCardProps {
  model: CarModel;
  isCollected: boolean;
  spotCount: number;
  /** Signed URL of the cover photo (the most recent spot of this model). */
  photoUrl?: string;
  /**
   * Storage path of the cover photo. A signed URL changes every time it is requested, the path
   * does not, so the path is the image cache key (course ch. 21).
   */
  photoPath?: string;
  onPress: () => void;
}

/** One sticker slot: a photo when collected, a locked placeholder otherwise. */
export function StickerCard({ model, isCollected, spotCount, photoUrl, photoPath, onPress }: StickerCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const name = `${model.make} ${model.model}`;
  const details = { name, number: model.stickerNumber, rarity: t(`rarity.${model.rarity}`) };

  return (
    <Card
      onPress={onPress}
      variant={isCollected ? 'default' : 'muted'}
      accessibilityLabel={
        isCollected
          ? t('ui.sticker_collected_a11y', { ...details, count: spotCount })
          : t('ui.sticker_locked_a11y', details)
      }
      testID={`sticker-${model.id}`}
    >
      <View style={styles.picture}>
        {isCollected && photoUrl !== undefined ? (
          <Image
            source={{ uri: photoUrl, cacheKey: photoPath }}
            contentFit="cover"
            style={StyleSheet.absoluteFill}
            accessibilityLabel={t('ui.car_photo_a11y', { name })}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Icon
            name={isCollected ? 'image-outline' : 'lock-closed-outline'}
            size={28}
            color={isCollected ? colors.accent : colors.textSubtle}
          />
        )}
        <View style={styles.number}>
          <Text size="sm" weight="bold" color={colors.onPrimary}>
            {t('ui.sticker_number', { number: model.stickerNumber })}
          </Text>
        </View>
      </View>
      <Stack gap="xs" padding="sm">
        <Text size="sm" color={colors.textMuted} numberOfLines={1}>
          {model.make}
        </Text>
        <Text weight="bold" numberOfLines={1} color={isCollected ? colors.text : colors.textMuted}>
          {model.model}
        </Text>
        <RarityBadge rarity={model.rarity} />
      </Stack>
    </Card>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  picture: {
    aspectRatio: 4 / 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  number: {
    position: 'absolute',
    top: spacing.xs,
    start: spacing.xs,
    paddingHorizontal: spacing.xs + 2,
    borderRadius: radii.pill,
    // A dark scrim in both colour schemes, so the white number stays readable on any photo.
    backgroundColor: colors.overlay,
  },
}));
