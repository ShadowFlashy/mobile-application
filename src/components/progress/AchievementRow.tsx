import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { createThemedStyles, lines, rowHeights, spacing, touchTarget } from '../../theme';
import type { AchievementProgress, AchievementTier } from '../../types/Progress';
import { formatDate } from '../../utils/formatDate';
import { tierName } from '../../utils/revealTimeline';
import { ProgressBar } from '../primitives/ProgressBar';
import { Text } from '../primitives/Text';

export interface AchievementRowProps {
  achievement: AchievementProgress;
  /** The tier was earned but not seen yet: a plain "New" next to the name. */
  isNew?: boolean;
  /** The details line (progress to the next tier) is open. */
  open?: boolean;
  onPress?: () => void;
  /** The bottom hairline. Default true. */
  divider?: boolean;
}

type TierKey = 'tier_bronze' | 'tier_silver' | 'tier_gold' | 'tier_locked';

export function tierKey(tier: AchievementTier): TierKey {
  switch (tier) {
    case 0:
      return 'tier_locked';
    case 1:
      return 'tier_bronze';
    case 2:
      return 'tier_silver';
    case 3:
      return 'tier_gold';
  }
}

/** Progress towards the next tier, 0–1 (1 once gold). */
export function tierRatio(achievement: AchievementProgress): number {
  if (achievement.nextThreshold === undefined) return 1;
  if (achievement.nextThreshold <= 0) return 0;
  return Math.min(1, Math.max(0, achievement.value / achievement.nextThreshold));
}

/** The latest unlock date of an achievement (gold, else silver, else bronze). */
export function lastUnlock(achievement: AchievementProgress): string | undefined {
  const { gold, silver, bronze } = achievement.unlockedAt;
  return gold ?? silver ?? bronze;
}

/**
 * One achievement as a hairline row: the name over a one-line description (text-2), and the tier as
 * a word on the right over the date it was earned. Locked rows are text-2 and show their progress
 * instead. Pressing the row opens a 2 px progress line towards the next tier.
 */
export function AchievementRow({
  achievement,
  isNew = false,
  open = false,
  onPress,
  divider = true,
}: AchievementRowProps) {
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const id = `achievement-${achievement.id}`;
  const secret = achievement.isSecret && achievement.tier === 0;
  const earned = achievement.tier > 0;
  const title = secret ? t('achievements.secret_title') : t(`achievements.${achievement.id}.title`);
  const description = secret ? t('achievements.secret_description') : t(`achievements.${achievement.id}.description`);
  const tierText = t(`progress.${tierKey(achievement.tier)}`);
  const target = achievement.nextThreshold;
  const unlocked = lastUnlock(achievement);
  const progressText =
    target === undefined
      ? String(achievement.value)
      : t('progress.plaque_progress', { value: achievement.value, target });
  const baseLabel =
    target === undefined
      ? t('progress.plaque_label_maxed', { title, tier: tierText, value: achievement.value })
      : t('progress.plaque_label', { title, tier: tierText, value: achievement.value, target });
  const label = secret ? `${title}, ${tierText}` : isNew ? `${baseLabel}. ${t('progress.plaque_new')}` : baseLabel;
  const showDetails = open && !secret && target !== undefined;

  return (
    <View style={divider && styles.divider}>
      <Pressable
        onPress={onPress}
        disabled={onPress === undefined}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={t('progress.plaque_hint')}
        accessibilityState={{ expanded: showDetails }}
        aria-expanded={showDetails}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        testID={id}
      >
        <View style={styles.text}>
          <View style={styles.titleLine}>
            <Text variant="body" tone={earned ? 'text' : 'text2'} numberOfLines={1}>
              {title}
            </Text>
            {isNew && (
              <Text variant="meta" testID={`${id}-new`}>
                {t('progress.plaque_new')}
              </Text>
            )}
          </View>
          <Text variant="meta" tone="text2" numberOfLines={1}>
            {description}
          </Text>
        </View>
        <View style={styles.trailing}>
          <Text
            variant="body"
            tone={earned ? 'text' : 'text2'}
            align="right"
            testID={`${id}-${tierName(achievement.tier) ?? 'locked'}`}
          >
            {tierText}
          </Text>
          {earned && unlocked !== undefined ? (
            <Text variant="meta" tone="text2" align="right" testID={`${id}-date`}>
              {formatDate(unlocked, i18n.language)}
            </Text>
          ) : (
            !secret && (
              <Text variant="numS" tone="text2" align="right" testID={`${id}-progress`}>
                {progressText}
              </Text>
            )
          )}
        </View>
      </Pressable>
      {showDetails && (
        <View style={styles.details} testID={`${id}-details`} accessibilityLiveRegion="polite">
          <ProgressBar progress={tierRatio(achievement)} label={baseLabel} />
          <Text variant="meta" tone="text2">
            {`${progressText} · ${t('progress.plaque_next', { target })}`}
          </Text>
          {unlocked !== undefined && (
            <Text variant="meta" tone="text2">
              {t('progress.plaque_unlocked', { date: formatDate(unlocked, i18n.language) })}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  divider: { borderBottomWidth: lines.hairline, borderBottomColor: colors.line },
  row: {
    minHeight: Math.max(rowHeights.tall, touchTarget),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.sm,
  },
  pressed: { backgroundColor: colors.raise },
  text: { flex: 1, minWidth: 0 },
  titleLine: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  trailing: { flexShrink: 0, alignItems: 'flex-end' },
  details: { gap: spacing.sm, paddingBottom: spacing.smd },
}));
