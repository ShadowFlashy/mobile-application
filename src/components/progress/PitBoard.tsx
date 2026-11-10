import { useTranslation } from 'react-i18next';
import { Text as RNText, View } from 'react-native';
import { MINUTE } from '../../constants/time';
import { useNow } from '../../hooks/useNow';
import { borders, createThemedStyles, useTheme } from '../../theme';
import type { ChallengeProgress } from '../../types/Progress';
import { countdownTo, type Countdown } from '../../utils/progression';
import { Icon } from '../primitives/Icon';
import { useChallengeText } from './challengeText';

export interface PitBoardProps {
  challenge: ChallengeProgress;
  /** ISO end of the challenge week. */
  endsAt: string;
  compact?: boolean;
}

/** "4d 13h", "5h 02m" or "12m" left. */
function useCountdownLabel(countdown: Countdown): string {
  const { t } = useTranslation();
  if (countdown.isOver) return t('progress.ended');
  const minutes = String(countdown.minutes).padStart(2, '0');
  const time =
    countdown.days > 0
      ? t('progress.time_days', { days: countdown.days, hours: countdown.hours })
      : countdown.hours > 0
        ? t('progress.time_hours', { hours: countdown.hours, minutes })
        : t('progress.time_minutes', { minutes: countdown.minutes });
  return t('progress.ends_in', { time });
}

/** A chequered-flag stamp for a completed board (text + flag, never colour alone). */
function DoneStamp({ testID }: { testID: string }) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.stamp} testID={testID}>
      <View style={styles.checker}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((cell) => (
          <View
            key={cell}
            style={[styles.checkerCell, (cell + Math.floor(cell / 4)) % 2 === 0 && styles.checkerDark]}
          />
        ))}
      </View>
      <RNText style={styles.stampText}>{t('progress.board_done')}</RNText>
    </View>
  );
}

/**
 * A weekly challenge on a motorsport pit board: slot, the task, progress, XP and a live countdown to
 * Monday 00:00. Completed boards get a chequered DONE stamp. `compact` is the one-line album teaser.
 */
export function PitBoard({ challenge, endsAt, compact = false }: PitBoardProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { instruments } = useTheme();
  const { describe, slotLabel } = useChallengeText();
  const now = useNow(MINUTE);
  const countdownLabel = useCountdownLabel(countdownTo(endsAt, now));
  const { slot, target, xp } = challenge.challenge;
  const description = describe(challenge.challenge);
  const value = Math.min(challenge.value, target);
  const ratio = target > 0 ? value / target : 0;
  const slotText = slotLabel(slot);
  const label = challenge.isComplete
    ? t('progress.board_label_done', { slot: slotText, description, xp })
    : t('progress.board_label', { slot: slotText, description, value, target, xp });

  if (compact) {
    return (
      <View style={[styles.board, styles.compact]} accessible accessibilityLabel={label} testID={`pit-board-${slot}`}>
        <RNText style={styles.slot}>{slotText}</RNText>
        <RNText style={[styles.descriptionSm, styles.flex]} numberOfLines={1}>
          {description}
        </RNText>
        {challenge.isComplete ? (
          <Icon name="flag" size={16} color={instruments.pitBoardAccent} />
        ) : (
          <RNText style={styles.progressText}>{t('progress.board_progress', { value, target })}</RNText>
        )}
      </View>
    );
  }

  return (
    <View style={styles.board} accessible accessibilityLabel={label} testID={`pit-board-${slot}`}>
      <View style={styles.headerRow}>
        <RNText style={styles.slot}>{slotText}</RNText>
        <RNText style={styles.xp}>{t('progress.board_xp', { xp })}</RNText>
      </View>
      <RNText style={styles.description}>{description}</RNText>
      <View style={styles.progressRow}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(ratio * 100)}%` }]} />
        </View>
        <RNText style={styles.progressText} testID={`pit-board-${slot}-progress`}>
          {t('progress.board_progress', { value, target })}
        </RNText>
      </View>
      <View style={styles.footerRow}>
        <RNText style={styles.countdown} testID={`pit-board-${slot}-countdown`}>
          {countdownLabel}
        </RNText>
        {challenge.isComplete && <DoneStamp testID={`pit-board-${slot}-done`} />}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ instruments, text, spacing, radii }) => ({
  board: {
    backgroundColor: instruments.pitBoard,
    borderRadius: radii.md,
    borderLeftWidth: 6,
    borderLeftColor: instruments.pitBoardAccent,
    padding: spacing.md,
    gap: spacing.sm,
  },
  compact: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.smd, minHeight: 48 },
  flex: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  slot: { ...text.label, color: instruments.pitBoardText },
  xp: { ...text.numberSm, color: instruments.pitBoardAccent },
  description: { ...text.headline, color: instruments.pitBoardText },
  descriptionSm: { ...text.bodySm, color: instruments.pitBoardText },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.smd },
  track: {
    flex: 1,
    height: 8,
    borderRadius: radii.pill,
    overflow: 'hidden',
    borderWidth: borders.hairline,
    borderColor: instruments.pitBoardText,
  },
  fill: { height: '100%', backgroundColor: instruments.pitBoardAccent },
  progressText: { ...text.numberSm, color: instruments.pitBoardText },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 24 },
  countdown: { ...text.caption, color: instruments.pitBoardText },
  stamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
    borderWidth: borders.strong,
    borderColor: instruments.pitBoardText,
    transform: [{ rotate: '-4deg' }],
  },
  checker: { width: 16, height: 8, flexDirection: 'row', flexWrap: 'wrap' },
  checkerCell: { width: 4, height: 4, backgroundColor: instruments.pitBoardText },
  checkerDark: { backgroundColor: instruments.pitBoard },
  stampText: { ...text.label, color: instruments.pitBoardText },
}));
