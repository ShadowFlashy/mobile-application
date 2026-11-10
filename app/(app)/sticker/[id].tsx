import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AlbumSkeleton } from '../../../src/components/album/AlbumSkeleton';
import { stickerNo, useAlbumTitles } from '../../../src/components/album/albumLabels';
import { DuplicatesStrip } from '../../../src/components/album/DuplicatesStrip';
import { PaintValue } from '../../../src/components/album/PaintValue';
import { SectionText } from '../../../src/components/album/SectionText';
import { StickerHero } from '../../../src/components/album/StickerHero';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { ListRow } from '../../../src/components/primitives/ListRow';
import { Screen } from '../../../src/components/primitives/Screen';
import { Section } from '../../../src/components/primitives/Section';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useAlbum } from '../../../src/hooks/useAlbum';
import { collectionsOfModel, pageIdOfModel, stickerXp } from '../../../src/utils/album';
import { formatDate } from '../../../src/utils/formatDate';

/** One sticker: collected (photo, detail rows, every spot, its sets) or missing (silhouette, worth, Spot it). */
export default function StickerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { collectionTitle, pageTitle, funFact } = useAlbumTitles();
  const { slotByModelId, pageById, collections, isLoading, isError } = useAlbum();
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
          icon="album"
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
  const sets = collectionsOfModel(collections, model.id);
  const fact = funFact(model.id);
  const pageId = pageIdOfModel(model);
  const page = pageById(pageId);

  return (
    <Screen
      testID="sticker-detail-screen"
      footer={
        isCollected ? undefined : (
          <StyledButton
            label={t('sticker_detail.spot_it')}
            icon="camera"
            variant="primary"
            onPress={() => router.push(routes.spot)}
            testID="sticker-spot-it"
          />
        )
      }
    >
      <Stack gap="lg">
        <StickerHero model={model} isCollected={isCollected} cover={cover} spotCount={spots.length} />

        {isCollected ? (
          <Section title={t('sticker_detail.details')} testID="sticker-details">
            <ListRow
              kind="detail"
              title={t('sticker_detail.spotted')}
              value={t('sticker_detail.spotted_count', { count: spots.length })}
              testID="sticker-status"
            />
            {cover !== undefined && (
              <ListRow
                kind="detail"
                title={t('sticker_detail.first_date')}
                value={formatDate(cover.spottedAt, i18n.language)}
              />
            )}
            {cover?.city !== undefined && <ListRow kind="detail" title={t('sticker_detail.city')} value={cover.city} />}
            {cover !== undefined && (
              <ListRow kind="detail" title={t('sticker_detail.paint')} trailing={<PaintValue paint={cover.paint} />} />
            )}
            <ListRow
              kind="detail"
              title={t('sticker_detail.page')}
              value={`${stickerNo(page?.number ?? 0)} ${pageTitle(pageId)}`}
              chevron
              onPress={() => router.push(routes.albumPage(pageId))}
              testID="sticker-page-link"
            />
          </Section>
        ) : (
          <Section title={t('sticker_detail.locked_title')} testID="sticker-locked">
            <ListRow
              kind="detail"
              title={t('sticker_detail.worth_label')}
              value={t('sticker_detail.worth', { xp: stickerXp(model.rarity) })}
              testID="sticker-worth"
            />
            <ListRow
              kind="detail"
              title={t('sticker_detail.page')}
              value={`${stickerNo(page?.number ?? 0)} ${pageTitle(pageId)}`}
              chevron
              onPress={() => router.push(routes.albumPage(pageId))}
              testID="sticker-page-link"
            />
            <SectionText>
              <Text variant="value" tone="text2">
                {t('sticker_detail.locked_description', { car })}
              </Text>
              <Text variant="value" tone="text2" testID="sticker-rarity-explainer">
                {t(`sticker_detail.rarity_explainer.${model.rarity}`)}
              </Text>
            </SectionText>
          </Section>
        )}

        {sets.length > 0 && (
          <Section title={t('sticker_detail.in_sets')} testID="sticker-sets">
            {sets.map((set) => (
              <ListRow
                key={set.collectionId}
                title={collectionTitle(set.collectionId)}
                value={t('album.progress_count', { collected: set.collected, total: set.total })}
                chevron
                onPress={() => router.push(routes.albumCollection(set.collectionId))}
                accessibilityLabel={t('album.set_card_label', {
                  number: set.number,
                  title: collectionTitle(set.collectionId),
                  collected: set.collected,
                  total: set.total,
                })}
                testID={`sticker-set-${set.collectionId}`}
              />
            ))}
          </Section>
        )}

        {isCollected && (
          <Section title={t('sticker_detail.your_spots')}>
            <DuplicatesStrip spots={spots} onPressSpot={(spot) => router.push(routes.spotDetail(spot.id))} />
          </Section>
        )}

        {fact !== undefined && (
          <Section title={t('sticker_detail.fun_fact_title')} testID="sticker-fun-fact">
            <SectionText>
              <Text variant="value">{fact}</Text>
            </SectionText>
          </Section>
        )}
      </Stack>
    </Screen>
  );
}
