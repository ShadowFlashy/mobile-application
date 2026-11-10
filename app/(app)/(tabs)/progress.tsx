import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AchievementCabinet } from '../../../src/components/progress/AchievementCabinet';
import { PitBoard } from '../../../src/components/progress/PitBoard';
import { StreakCounter } from '../../../src/components/progress/StreakCounter';
import { XpSummary } from '../../../src/components/progress/XpSummary';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { Screen } from '../../../src/components/primitives/Screen';
import { Section } from '../../../src/components/primitives/Section';
import { Skeleton } from '../../../src/components/primitives/Skeleton';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useProgress } from '../../../src/hooks/useProgress';
import { useSeenAchievements } from '../../../src/hooks/useSeenAchievements';
import { useMySpots } from '../../../src/hooks/useSpots';

/** Pit Wall tab (SPEC P0-14): level and XP, the weekly streak, three pit boards and the plaques. */
export default function ProgressScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { snapshot, isLoading } = useProgress();
  const { isNew, markSeen } = useSeenAchievements();
  const spots = useMySpots();

  return (
    <Screen testID="progress-screen" refreshing={spots.isRefetching} onRefresh={() => void spots.refetch()}>
      <Stack gap="lg">
        <ScreenHeader
          eyebrow={t('progress.eyebrow')}
          title={t('shell.progress_title')}
          subtitle={t('progress.subtitle')}
        />
        {snapshot === undefined ? (
          isLoading ? (
            <Stack gap="md" testID="progress-loading">
              <Skeleton preset="board" shape="sticker" />
              <Skeleton preset="card" shape="sticker" />
              <Skeleton preset="plaque" shape="sticker" />
            </Stack>
          ) : (
            <EmptyState
              icon="alert-circle-outline"
              title={t('progress.load_error')}
              action={<StyledButton label={t('common.try_again')} onPress={() => void spots.refetch()} />}
              testID="progress-error"
            />
          )
        ) : (
          <>
            <XpSummary level={snapshot.level} />
            {snapshot.ledger.length === 0 && (
              <EmptyState
                icon="flag-outline"
                title={t('progress.empty_title')}
                description={t('progress.empty_description')}
                action={
                  <StyledButton label={t('tabs.spot')} variant="ignition" onPress={() => router.push(routes.spot)} />
                }
                testID="progress-empty"
              />
            )}
            <StreakCounter streak={snapshot.streak} />
            <Section title={t('progress.this_week')} testID="pit-boards">
              <Stack gap="smd">
                {snapshot.challenges.map((challenge) => (
                  <PitBoard key={challenge.challenge.id} challenge={challenge} endsAt={snapshot.weekEndsAt} />
                ))}
              </Stack>
            </Section>
            <Section title={t('progress.achievements_title')} testID="achievements">
              <Stack gap="sm">
                <Text variant="bodySm" tone="muted">
                  {t('progress.achievements_hint')}
                </Text>
                <AchievementCabinet
                  achievements={snapshot.achievements}
                  isNew={isNew}
                  onOpen={(achievement) => markSeen([achievement])}
                />
              </Stack>
            </Section>
          </>
        )}
      </Stack>
    </Screen>
  );
}
