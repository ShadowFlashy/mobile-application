import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AlbumSkeleton } from '../../../src/components/album/AlbumSkeleton';
import { useAlbumTitles } from '../../../src/components/album/albumLabels';
import { DuplicatesStrip } from '../../../src/components/album/DuplicatesStrip';
import { StickerHero } from '../../../src/components/album/StickerHero';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { Row } from '../../../src/components/primitives/Row';
import { Screen } from '../../../src/components/primitives/Screen';
import { Section } from '../../../src/components/primitives/Section';
import { Stack } from '../../../src/components/primitives/Stack';
import { Surface } from '../../../src/components/primitives/Surface';
import { Tag } from '../../../src/components/primitives/Tag';
import { Text } from '../../../src/components/primitives/Text';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useAlbum } from '../../../src/hooks/useAlbum';
import { collectionsOfModel, stickerXp } from '../../../src/utils/album';
import { formatDate } from '../../../src/utils/formatDate';

/** One sticker: collected (hero foil, spots, duplicates) or locked (silhouette, worth, Spot it). */
export default function StickerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { collectionTitle, funFact } = useAlbumTitles();
  const { slotByModelId, collections, isLoading, isError } = useAlbum();
  const slot = id !== undefined ? slotByModelId(id) : undefined;

  if (slot === undefined && isLoading) {
    return (
      <Screen testID="sticker-detail-loading">
        <AlbumSkeleton variant="page" />
      </Screen>
    );
  }

  if (slot === undefined) {
    return (
      <Screen>
        <EmptyState
          icon="albums-outline"
          title={t('sticker_detail.not_found')}
          description={isError ? t('errors.load_collection') : t('sticker_detail.not_found_description')}
          action={<StyledButton label={t('album.back_to_album')} onPress={() => router.replace(routes.home)} />}
          testID="sticker-not-found"
        />
      </Screen>
    );
  }

  const { model, spots, isCollected, cover } = slot;
  const car = `${model.make} ${model.model}`;
  const rarity = t(`rarity.${model.rarity}`);
  const sets = collectionsOfModel(collections, model.id);
  const fact = funFact(model.id);

  return (
    <Screen
      testID="sticker-detail-screen"
      footer={
        isCollected ? undefined : (
          <StyledButton
            label={t('sticker_detail.spot_it')}
            icon="camera"
            variant="ignition"
            onPress={() => router.push(routes.spot)}
            testID="sticker-spot-it"
          />
        )
      }
    >
      <Stack gap="lg">
        <StickerHero model={model} isCollected={isCollected} cover={cover} spotCount={spots.length} />

        {isCollected ? (
          <Stack gap="md">
            <Text variant="bodyStrong" testID="sticker-status">
              {t('sticker_detail.spotted_status', {
                count: spots.length,
                date: cover !== undefined ? formatDate(cover.spottedAt, i18n.language) : '',
              })}
            </Text>
            <Section title={t('sticker_detail.your_spots')}>
              <DuplicatesStrip spots={spots} onPressSpot={(spot) => router.push(routes.spotDetail(spot.id))} />
            </Section>
          </Stack>
        ) : (
          <Stack gap="md" testID="sticker-locked">
            <Text variant="title" tone="accent" testID="sticker-worth">
              {t('sticker_detail.worth', { xp: stickerXp(model.rarity) })}
            </Text>
            <Stack gap="xs">
              <Text variant="headline" heading>
                {t('sticker_detail.locked_title')}
              </Text>
              <Text tone="muted">{t('sticker_detail.locked_description', { car })}</Text>
            </Stack>
            <Surface variant="flat" padding="md" testID="sticker-rarity-explainer">
              <Stack gap="xs">
                <Text variant="label" tone="muted">
                  {t('sticker_detail.rarity_title', { rarity })}
                </Text>
                <Text variant="bodySm">{t(`sticker_detail.rarity_explainer.${model.rarity}`)}</Text>
              </Stack>
            </Surface>
          </Stack>
        )}

        {fact !== undefined && (
          <Surface variant="sunken" padding="md" testID="sticker-fun-fact">
            <Stack gap="xs">
              <Text variant="label" tone="muted">
                {t('sticker_detail.fun_fact_title')}
              </Text>
              <Text>{fact}</Text>
            </Stack>
          </Surface>
        )}

        {sets.length > 0 && (
          <Section title={t('sticker_detail.in_sets')} testID="sticker-sets">
            <Row gap="sm" wrap>
              {sets.map((set) => (
                <Tag
                  key={set.collectionId}
                  label={`${collectionTitle(set.collectionId)} · ${t('album.progress_count', { collected: set.collected, total: set.total })}`}
                  icon="albums-outline"
                  onPress={() => router.push(routes.albumCollection(set.collectionId))}
                  testID={`sticker-set-${set.collectionId}`}
                />
              ))}
            </Row>
          </Section>
        )}
      </Stack>
    </Screen>
  );
}
