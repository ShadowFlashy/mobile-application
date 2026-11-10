import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { MINUTE } from '../../constants/time';
import { useNow } from '../../hooks/useNow';
import { columns, createThemedStyles, spacing } from '../../theme';
import type { ChallengeProgress } from '../../types/Progress';
import { countdownTo } from '../../utils/progression';
import { Icon } from '../primitives/Icon';
import { ListRow } from '../primitives/ListRow';
import { Section } from '../primitives/Section';
import { Text } from '../primitives/Text';
import { useChallengeText } from '../progress/challengeText';

export interface WeekChallengesProps {
  /** This week's three challenges (warm-up, main, stretch). */
  challenges: readonly ChallengeProgress[];
  /** ISO end of the challenge week. */
  endsAt: string;
  /** Test hook: the moment the countdown is measured from. */
  now?: Date;
  testID?: string;
}

/** "Ends in 5d 10h", "Ends in 5h 02m", "Ends in 12m" or "Week over". */
function useEndsIn(endsAt: string, now: Date): string {
  const { t } = useTranslation();
  const countdown = countdownTo(endsAt, now);
  if (countdown.isOver) return t('album.week_over');
  const time =
    countdown.days > 0
      ? t('album.time_days', { days: countdown.days, hours: countdown.hours })
      : countdown.hours > 0
        ? t('album.time_hours', { hours: countdown.hours, minutes: String(countdown.minutes).padStart(2, '0') })
        : t('album.time_minutes', { minutes: countdown.minutes });
  return t('album.ends_in', { time });
}

/**
 * "This week": one 40 px hairline row per challenge with its name, the count (num) and the XP
 * (num-s, text-2). A finished challenge shows a check and recedes to text-2.
 */
export function WeekChallenges({ challenges, endsAt, now, testID = 'album-week' }: WeekChallengesProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const ticking = useNow(MINUTE);
  const endsIn = useEndsIn(endsAt, now ?? ticking);
  const { describe } = useChallengeText();

  return (
    <Section title={t('album.this_week')} meta={endsIn} testID={testID}>
      {challenges.map((progress) => {
        const { challenge } = progress;
        const description = describe(challenge);
        const value = Math.min(progress.value, challenge.target);
        const xp = t('album.challenge_xp', { xp: challenge.xp });
        const label = progress.isComplete
          ? t('album.challenge_label_done', { description, xp })
          : t('album.challenge_label', { description, value, target: challenge.target, xp });
        return (
          <View key={challenge.id} accessible accessibilityLabel={label} testID={`challenge-${challenge.slot}`}>
            <ListRow
              title={description}
              pitch="compact"
              muted={progress.isComplete}
              trailing={
                <View style={styles.cells}>
                  <View style={styles.count}>
                    {progress.isComplete ? (
                      <Icon name="check" size={20} testID={`challenge-${challenge.slot}-done`} />
                    ) : (
                      <Text variant="num" align="right">
                        {t('album.challenge_count', { value, target: challenge.target })}
                      </Text>
                    )}
                  </View>
                  <View style={styles.xp}>
                    <Text variant="numS" tone="text2" align="right">
                      {xp}
                    </Text>
                  </View>
                </View>
              }
            />
          </View>
        );
      })}
    </Section>
  );
}

const useStyles = createThemedStyles(() => ({
  cells: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  count: { minWidth: columns.count, alignItems: 'flex-end' },
  xp: { minWidth: columns.xp, alignItems: 'flex-end' },
}));
