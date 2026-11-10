import { useTranslation } from 'react-i18next';
import type { ChallengeProgress } from '../../types/Progress';
import { Section } from '../primitives/Section';
import { Text } from '../primitives/Text';
import { ChallengeRow } from './ChallengeRow';
import { useWeekCountdown } from '../../hooks/useWeekCountdown';

export interface ChallengeListProps {
  challenges: readonly ChallengeProgress[];
  /** ISO end of the challenge week (Monday 00:00 in Brussels). */
  endsAt: string;
  /** Default `challenges`; the countdown gets `<testID>-countdown`. */
  testID?: string;
}

/** "This week": the three weekly challenges as hairline rows, with a live countdown on the right. */
export function ChallengeList({ challenges, endsAt, testID = 'challenges' }: ChallengeListProps) {
  const { t } = useTranslation();
  const countdown = useWeekCountdown(endsAt);
  return (
    <Section
      title={t('progress.this_week')}
      action={
        <Text variant="meta" tone="text2" align="right" testID={`${testID}-countdown`}>
          {countdown}
        </Text>
      }
      testID={testID}
    >
      {challenges.map((challenge) => (
        <ChallengeRow key={challenge.challenge.id} challenge={challenge} />
      ))}
    </Section>
  );
}
