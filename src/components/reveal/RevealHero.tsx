import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { aspect, createThemedStyles } from '../../theme';
import type { RevealData } from '../../types/Progress';
import { CarSilhouette } from '../album/CarSilhouette';
import { ListRow } from '../primitives/ListRow';
import { PhotoFrame } from '../primitives/PhotoFrame';
import { RarityRoundel } from '../primitives/RarityRoundel';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';

export interface RevealHeroProps {
  reveal: RevealData;
  /** The name of the first set the car belongs to (else the album page), under the car's name. */
  setTitle?: string;
  testID?: string;
}

/** Width of the silhouette drawn on the photo backdrop when the spot has no photo URL. */
const SILHOUETTE_SIZE = 220;

/** The car's name as the reveal shows it ("Ferrari 308 GTSi"). */
export function revealCarName(reveal: RevealData, fallback: string): string {
  if (reveal.model !== undefined) return `${reveal.model.make} ${reveal.model.model}`;
  return `${reveal.spot.make} ${reveal.spot.model}`.trim() || fallback;
}

/**
 * The top of the reveal: the photo (radius 8, or the silhouette on the raise backdrop), the sticker
 * number in hero numerals with "New sticker" / "Duplicate ×3" next to it, and the car with its set and
 * its rarity roundel spelled out.
 */
export function RevealHero({ reveal, setTitle, testID = 'reveal-hero' }: RevealHeroProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const carName = revealCarName(reveal, t('reveal.unknown_car'));
  const photoUrl = reveal.spot.photoUrl;
  const number = reveal.model !== undefined ? String(reveal.model.stickerNumber).padStart(2, '0') : undefined;
  const status = t(`reveal.headline.${reveal.kind}`, { count: reveal.count });

  return (
    <Stack gap="md" testID={testID}>
      <PhotoFrame
        uri={photoUrl}
        cacheKey={reveal.spot.photoPath}
        aspectRatio={aspect.photo}
        accessibilityLabel={
          photoUrl !== undefined
            ? t('reveal.photo_label', { car: carName })
            : t('reveal.silhouette_label', { car: carName })
        }
        overlay={
          photoUrl === undefined ? (
            <View style={styles.silhouette}>
              <CarSilhouette
                bodyStyle={reveal.model?.bodyStyle ?? reveal.spot.bodyStyle}
                size={SILHOUETTE_SIZE}
                tone="silhouette"
              />
            </View>
          ) : undefined
        }
        testID="reveal-photo"
      />
      <Row justify="space-between" align="baseline" gap="md">
        {number !== undefined && (
          <Text variant="hero" accessibilityLabel={t('reveal.number_label', { number })} testID="reveal-number">
            <Text variant="heroSub" tone="text2">
              #
            </Text>
            {number}
          </Text>
        )}
        <Text variant="heading" align="right" heading testID={`reveal-status-${reveal.kind}`}>
          {status}
        </Text>
      </Row>
      <ListRow
        title={carName}
        subtitle={reveal.model !== undefined ? setTitle : t('reveal.wildcard_line')}
        kind="primary"
        pitch="tall"
        trailing={
          reveal.model !== undefined ? (
            <RarityRoundel rarity={reveal.model.rarity} showLabel testID={`reveal-rarity-${reveal.model.rarity}`} />
          ) : undefined
        }
        testID="reveal-car"
      />
    </Stack>
  );
}

const useStyles = createThemedStyles(() => ({
  silhouette: { flex: 1, alignItems: 'center', justifyContent: 'center' },
}));
