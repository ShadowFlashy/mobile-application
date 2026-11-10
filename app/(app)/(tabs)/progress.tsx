import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../src/components/primitives/EmptyState';
import { Screen } from '../../../src/components/primitives/Screen';
import { Skeleton } from '../../../src/components/primitives/Skeleton';
import { Stack } from '../../../src/components/primitives/Stack';
import { AchievementList } from '../../../src/components/progress/AchievementList';
import { ChallengeList } from '../../../src/components/progress/ChallengeList';
import { StatsReadouts } from '../../../src/components/progress/StatsReadouts';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useAlbum } from '../../../src/hooks/useAlbum';
import { useProgress } from '../../../src/hooks/useProgress';
import { useSeenAchievements } from '../../../src/hooks/useSeenAchievements';
import { useMySpots } from '../../../src/hooks/useSpots';

/** Stats tab (SPEC P0-14): the level, stickers, spots and streak readouts, this week's challenges and the achievements. */
export default function ProgressScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { snapshot, isLoading } = useProgress();
  const { isNew, markSeen } = useSeenAchievements();
  const { cover } = useAlbum();
  const spots = useMySpots();
  const totalXp = snapshot !== undefined ? new Intl.NumberFormat(i18n.language).format(snapshot.xp) : undefined;

  return (
    <Screen
      title={t('shell.progress_title')}
      meta={totalXp !== undefined ? t('progress.xp_total', { xp: totalXp }) : undefined}
      testID="progress-screen"
      refreshing={spots.isRefetching}
      onRefresh={() => void spots.refetch()}
    >
      {snapshot === undefined ? (
        isLoading ? (
          <Stack gap="lg" testID="progress-loading">
            <Skeleton preset="header" />
            <Skeleton preset="row" />
            <Skeleton preset="row" />
            <Skeleton preset="row" />
          </Stack>
        ) : (
          <EmptyState
            icon="alert"
            title={t('progress.load_error')}
            action={<StyledButton label={t('common.try_again')} onPress={() => void spots.refetch()} />}
            testID="progress-error"
          />
        )
      ) : (
        <Stack gap="lg">
          <StatsReadouts
            level={snapshot.level}
            stickers={{ collected: cover.collected, total: cover.total }}
            spots={spots.data?.length ?? 0}
            streak={snapshot.streak}
          />
          {snapshot.ledger.length === 0 && (
            <EmptyState
              icon="camera"
              title={t('progress.empty_title')}
              description={t('progress.empty_description')}
              action={<StyledButton label={t('album.spot_a_car')} onPress={() => router.push(routes.spot)} />}
              testID="progress-empty"
            />
          )}
          <ChallengeList challenges={snapshot.challenges} endsAt={snapshot.weekEndsAt} />
          <AchievementList
            achievements={snapshot.achievements}
            isNew={isNew}
            onOpen={(achievement) => markSeen([achievement])}
          />
        </Stack>
      )}
    </Screen>
  );
}
