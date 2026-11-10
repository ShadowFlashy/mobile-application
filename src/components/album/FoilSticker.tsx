import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, View, type LayoutChangeEvent } from 'react-native';
import { borders, createThemedStyles, easings, elevation, useMotion, useTheme } from '../../theme';
import type { CarModel } from '../../types/CarModel';
import type { AlbumPageId, StampKind } from '../../types/Progress';
import type { Spot } from '../../types/Spot';
import { slotTilt } from '../../utils/album';
import { PhotoFrame } from '../primitives/PhotoFrame';
import { PressableScale } from '../primitives/PressableScale';
import { Gradient } from '../primitives/Gradient';
import { Text } from '../primitives/Text';
import { CarSilhouette } from './CarSilhouette';
import { RarityPips } from './RarityPips';
import { StampBadge } from './StampBadge';

export type FoilStickerSize = 'sm' | 'md' | 'lg' | 'hero';
export type FoilSheen = 'none' | 'once' | 'loop';

export interface FoilStickerProps {
  /** The catalogue model; undefined = a wildcard (off-catalogue spot). */
  model?: CarModel;
  /** The spot whose photo is on the sticker (the first collected one). */
  spot?: Spot;
  photoUrl?: string;
  photoPath?: string;
  size: FoilStickerSize;
  stamp?: StampKind;
  count?: number;
  /** The page whose livery paints the number tab. */
  pageId: AlbumPageId;
  /** Seed of the deterministic hand-stuck tilt (usually the model or spot id). */
  tiltSeed: string;
  /** Default: `loop` on hero epic/legendary stickers, otherwise `once`. Reduced motion = `none`. */
  sheen?: FoilSheen;
  onPress?: () => void;
  testID?: string;
}

const MAX_WIDTH: Record<FoilStickerSize, number> = { sm: 124, md: 200, lg: 260, hero: 300 };
const EDGE: Record<FoilStickerSize, number> = { sm: 4, md: 6, lg: 7, hero: 9 };
/** Pause between two sheen sweeps of a looping hero sticker. */
const SHEEN_LOOP_PAUSE_MS = 2400;

/** The sheen to play: hero epic and legendary stickers loop, every other sticker glints once. */
function resolveSheen(sheen: FoilSheen | undefined, size: FoilStickerSize, model: CarModel | undefined): FoilSheen {
  if (sheen !== undefined) return sheen;
  const isChase = model?.rarity === 'epic' || model?.rarity === 'legendary';
  return size === 'hero' && isChase ? 'loop' : 'once';
}

/**
 * A die-cut foil sticker. The edge is the foil of its rarity (matte, chrome, holo or gold), the
 * photo sits concentric inside it, the number tab wears the page livery, and the whole sticker is
 * stuck on with a seeded tilt of at most ±2.5°, so it never jitters between renders.
 */
export function FoilSticker({
  model,
  spot,
  photoUrl,
  photoPath,
  size,
  stamp,
  count,
  pageId,
  tiltSeed,
  sheen,
  onPress,
  testID,
}: FoilStickerProps) {
  const { t } = useTranslation();
  const { finishes, liveries, instruments } = useTheme();
  const styles = useStyles();
  const { reduced, nativeDriver, duration } = useMotion();
  const [width, setWidth] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  const finish = finishes[model?.rarity ?? 'common'];
  const livery = liveries[pageId];
  const effectiveSheen = reduced ? 'none' : resolveSheen(sheen, size, model);
  const uri = photoUrl ?? spot?.photoUrl;
  const cacheKey = photoPath ?? spot?.photoPath;
  const make = model?.make ?? spot?.make ?? '';
  const modelName = model?.model ?? spot?.model ?? '';
  const car = `${make} ${modelName}`.trim();
  const tilt = slotTilt(tiltSeed);

  const label =
    model !== undefined
      ? t('album.sticker_label', {
          count: count ?? 1,
          number: model.stickerNumber,
          car,
          rarity: t(`rarity.${model.rarity}`),
        })
      : t('album.wildcard_label', { car });

  useEffect(() => {
    if (effectiveSheen === 'none' || width === 0) return undefined;
    progress.setValue(0);
    const sweep = Animated.timing(progress, {
      toValue: 1,
      duration: duration('sheen'),
      easing: easings.standard,
      useNativeDriver: nativeDriver,
    });
    const animation =
      effectiveSheen === 'loop'
        ? Animated.loop(Animated.sequence([sweep, Animated.delay(SHEEN_LOOP_PAUSE_MS)]))
        : sweep;
    animation.start();
    return () => animation.stop();
  }, [effectiveSheen, width, progress, duration, nativeDriver]);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-width, width * 1.4] });
  const isSmall = size === 'sm';

  const body = (
    <View
      style={[
        styles.sticker,
        { maxWidth: MAX_WIDTH[size], padding: EDGE[size], transform: [{ rotate: `${tilt}deg` }] },
      ]}
      onLayout={onLayout}
      testID={`foil-finish-${finish.name}`}
    >
      <Gradient colors={finish.edge} direction="diagonal" fill />
      <View style={[styles.paper, { backgroundColor: instruments.roundel }]}>
        <PhotoFrame
          uri={uri}
          cacheKey={cacheKey}
          radius="stickerInner"
          accessibilityLabel={car}
          overlay={
            uri === undefined ? (
              <View style={styles.placeholder}>
                <CarSilhouette
                  bodyStyle={model?.bodyStyle ?? spot?.bodyStyle ?? 'other'}
                  size={isSmall ? 64 : 120}
                  tone="onStage"
                />
              </View>
            ) : undefined
          }
        />
        {finish.wash !== undefined && (
          <View style={[styles.wash, { opacity: finish.washOpacity }]} pointerEvents="none">
            <Gradient colors={finish.wash} direction="diagonal" fill />
          </View>
        )}
        <View style={[styles.caption, isSmall ? styles.captionSmall : styles.captionLarge]}>
          {!isSmall && (
            <Text variant={size === 'hero' ? 'label' : 'caption'} color={instruments.roundelInk} numberOfLines={1}>
              {make}
            </Text>
          )}
          <Text
            variant={size === 'hero' ? 'headline' : isSmall ? 'caption' : 'bodyStrong'}
            color={instruments.roundelInk}
            numberOfLines={1}
          >
            {isSmall ? car : modelName}
          </Text>
          {model !== undefined && !isSmall && (
            <RarityPips rarity={model.rarity} size={size === 'hero' ? 'md' : 'sm'} color={instruments.roundelInk} />
          )}
        </View>
      </View>
      {model !== undefined && (
        <View style={[styles.tab, { backgroundColor: livery.base, borderColor: instruments.roundel }]}>
          <Text variant="stickerNo" color={livery.text}>
            {`#${String(model.stickerNumber).padStart(2, '0')}`}
          </Text>
        </View>
      )}
      {stamp !== undefined && (
        <View style={styles.stamp}>
          <StampBadge kind={stamp} count={count} size={isSmall ? 'sm' : 'md'} />
        </View>
      )}
      {effectiveSheen !== 'none' && width > 0 && (
        <Animated.View
          style={[
            styles.sheen,
            {
              width: width * 0.35,
              backgroundColor: instruments.roundel,
              transform: [{ translateX }, { skewX: '-20deg' }],
            },
          ]}
          pointerEvents="none"
          testID="foil-sheen"
        />
      )}
    </View>
  );

  if (onPress === undefined) {
    return (
      <View style={styles.wrap} accessible accessibilityRole="image" accessibilityLabel={label} testID={testID}>
        {body}
      </View>
    );
  }
  return (
    <PressableScale onPress={onPress} accessibilityLabel={label} haptic="tap" testID={testID}>
      <View style={styles.wrap}>{body}</View>
    </PressableScale>
  );
}

const useStyles = createThemedStyles(({ spacing, radii, colors }) => ({
  wrap: { width: '100%', alignItems: 'center' },
  sticker: {
    width: '100%',
    borderRadius: radii.sticker,
    overflow: 'hidden',
    ...elevation.sticker,
  },
  paper: { borderRadius: radii.stickerInner, overflow: 'hidden' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.stage },
  wash: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  caption: { gap: spacing.xxs },
  captionSmall: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xxs },
  captionLarge: { paddingHorizontal: spacing.sm, paddingTop: spacing.xs, paddingBottom: spacing.sm },
  tab: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: radii.sm,
    borderWidth: borders.strong,
  },
  stamp: { position: 'absolute', top: spacing.sm, right: spacing.xs },
  sheen: { position: 'absolute', top: -20, bottom: -20, left: 0, opacity: 0.28 },
}));
