import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { Screen } from '../../../src/components/primitives/Screen';
import { Spinner } from '../../../src/components/primitives/Spinner';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { RevealStage } from '../../../src/components/reveal/RevealStage';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useAlbum } from '../../../src/hooks/useAlbum';
import { useCarModels, useCollections } from '../../../src/hooks/useCarModels';
import { useProgress } from '../../../src/hooks/useProgress';
import { useReveal } from '../../../src/hooks/useReveal';
import { useMySpots } from '../../../src/hooks/useSpots';
import { revealPageProgress, revealSetProgress, revealSets } from '../../../src/utils/revealTimeline';

/**
 * /reveal/<spotId> (SPEC P0-15): the sticker reveal, a full-screen modal on the stage. Everything is
 * re-derived from the query cache, so a refresh or a deep link replays the reveal of that spot.
 */
export default function RevealScreen() {
  const { spotId } = useLocalSearchParams<{ spotId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { reveal, isLoading, isMissing } = useReveal(spotId);
  const { snapshot } = useProgress();
  const { pageById } = useAlbum();
  const { data: spots } = useMySpots();
  const { data: models } = useCarModels();
  const collections = useCollections();

  // Wait for the sets only while they are actually loading (offline they stay out of the reveal).
  const setsSettled = collections.data !== undefined || collections.fetchStatus !== 'fetching';
  const collectionData = collections.data;

  const sets = useMemo(() => {
    if (reveal === undefined) return [];
    // The engine's set progress; derived here as a fallback when the engine left it empty.
    const fromEngine = revealSets(reveal);
    if (fromEngine.length > 0 || collectionData === undefined) return fromEngine;
    return revealSetProgress(reveal, spots ?? [], collectionData);
  }, [reveal, spots, collectionData]);
  const pageProgress = useMemo(
    () => (reveal !== undefined ? revealPageProgress(reveal, spots ?? [], models ?? []) : undefined),
    [reveal, spots, models],
  );

  const goToAlbum = () => router.replace(routes.home);

  if (isMissing) {
    return (
      <Screen variant="stage" testID="reveal-missing">
        <EmptyState
          tone="onStage"
          icon="search-outline"
          title={t('reveal.not_found_title')}
          description={t('reveal.not_found_description')}
          action={<StyledButton label={t('reveal.go_to_album')} onPress={goToAlbum} testID="reveal-go-album" />}
        />
      </Screen>
    );
  }

  if (reveal === undefined || !setsSettled) {
    return (
      <Screen variant="stage" scrollable={false} testID="reveal-loading">
        <Stack flex={1} gap="md" align="center" justify="center">
          <Spinner size="large" tone="onStage" />
          <Text tone="onStageMuted" align="center">
            {t('reveal.loading')}
          </Text>
          {!isLoading && reveal === undefined && (
            <StyledButton label={t('reveal.go_to_album')} variant="secondary" onPress={goToAlbum} />
          )}
        </Stack>
      </Screen>
    );
  }

  return (
    <RevealStage
      reveal={reveal}
      page={pageById(reveal.pageId)}
      pageProgress={pageProgress}
      sets={sets}
      achievements={snapshot?.achievements}
      onViewPage={() => router.replace(routes.albumPage(reveal.pageId))}
      onSpotAnother={() => router.replace(routes.spot)}
      testID="reveal-screen"
    />
  );
}
