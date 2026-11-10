import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { aspect, columns, createThemedStyles, lines, rowHeights, spacing, useMotion } from '../../theme';
import type { Rarity } from '../../types/CarModel';
import { RarityRoundel } from './RarityRoundel';
import { Text } from './Text';

interface TimingRowProps {
  /** The number column, e.g. "82" (rendered "#82" with a text-2 "#"), or a position. */
  number?: string;
  /** Show the "#" before the number. Default true. */
  hash?: boolean;
  /** A 72 × 30 photo crop; a `thumbnail` node wins over it. */
  imageUri?: string;
  imageCacheKey?: string;
  /** A custom 72 × 30 thumbnail, e.g. a car silhouette for a missing sticker. */
  thumbnail?: ReactNode;
  /** The car ("Ferrari 308 GTSi"). */
  title: string;
  /** A condensed text-2 suffix after the title ("×3"). */
  titleSuffix?: string;
  /** The line under the title ("Italian Exotics"). */
  subtitle?: string;
  /** The text-2 meta on the right ("Today"). */
  meta?: string;
  /** The rarity roundel under the meta. */
  rarity?: Rarity;
  onPress?: () => void;
  /** Spoken label; default number, title, subtitle, meta and the tier. */
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * The timing-tower row (A's "Latest catches"): a condensed number column, a 72 × 30 thumbnail, the
 * name over its set, and the date over a rarity roundel on the right. 56 px with a bottom hairline.
 */
export function TimingRow({
  number,
  hash = true,
  imageUri,
  imageCacheKey,
  thumbnail,
  title,
  titleSuffix,
  subtitle,
  meta,
  rarity,
  onPress,
  accessibilityLabel,
  testID,
}: TimingRowProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  // The photo fade is motion too: 0 ms with reduced motion.
  const { duration } = useMotion();
  const thumb =
    thumbnail ??
    (imageUri !== undefined ? (
      <Image
        source={imageCacheKey !== undefined ? { uri: imageUri, cacheKey: imageCacheKey } : { uri: imageUri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={duration('base')}
        accessible={false}
      />
    ) : null);

  const content = (
    <>
      {number !== undefined && (
        <View style={styles.number}>
          <Text variant="num" numberOfLines={1}>
            {hash && (
              <Text variant="num" tone="text2">
                {'#'}
              </Text>
            )}
            {number}
          </Text>
        </View>
      )}
      {thumb !== null && <View style={styles.thumb}>{thumb}</View>}
      <View style={styles.text}>
        <Text variant="body" numberOfLines={1}>
          {title}
          {titleSuffix !== undefined && <Text variant="numS" tone="text2">{` ${titleSuffix}`}</Text>}
        </Text>
        {subtitle !== undefined && (
          <Text variant="meta" tone="text2" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {(meta !== undefined || rarity !== undefined) && (
        <View style={styles.trailing}>
          {meta !== undefined && (
            <Text variant="meta" tone="text2" align="right" numberOfLines={1}>
              {meta}
            </Text>
          )}
          {rarity !== undefined && <RarityRoundel rarity={rarity} />}
        </View>
      )}
    </>
  );

  const label =
    accessibilityLabel ??
    [
      number !== undefined ? t('ui.sticker_number', { number }) : undefined,
      title,
      titleSuffix,
      subtitle,
      meta,
      rarity !== undefined ? t(`rarity.${rarity}`) : undefined,
    ]
      .filter(Boolean)
      .join(', ');

  if (onPress === undefined) {
    // One accessible element, so a screen reader reads the row as one sentence, like the button.
    return (
      <View style={styles.row} accessible accessibilityLabel={label} testID={testID}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID={testID}
    >
      {content}
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  row: {
    minHeight: rowHeights.tall,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  pressed: { backgroundColor: colors.raise },
  number: { minWidth: columns.number, flexShrink: 0 },
  thumb: {
    width: columns.thumb,
    aspectRatio: aspect.thumb,
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: radii.xs,
  },
  text: { flex: 1, minWidth: 0 },
  trailing: { minWidth: columns.trailing, flexShrink: 0, alignItems: 'flex-end', gap: spacing.xxs },
}));
