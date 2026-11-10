import { useTranslation } from 'react-i18next';
import { Pressable, Text as RNText, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { achievementDefinition } from '../../utils/progression';
import { borders, createThemedStyles, plaqueTiers, useTheme } from '../../theme';
import type { AchievementProgress, AchievementTier } from '../../types/Progress';
import { Gradient } from '../primitives/Gradient';
import { Icon } from '../primitives/Icon';

export interface DashPlaqueProps {
  achievement: AchievementProgress;
  isNew?: boolean;
  onPress?: () => void;
}

const RING = 64;
const STROKE = 5;

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

/** Progress towards the next threshold, 0–1 (1 once gold). */
export function plaqueRatio(achievement: AchievementProgress): number {
  if (achievement.nextThreshold === undefined) return 1;
  if (achievement.nextThreshold <= 0) return 0;
  return Math.min(1, Math.max(0, achievement.value / achievement.nextThreshold));
}

/** The circular progress ring of a locked plaque (react-native-svg). */
function ProgressRing({ ratio }: { ratio: number }) {
  const { colors } = useTheme();
  const radius = (RING - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <Svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`}>
      <Circle cx={RING / 2} cy={RING / 2} r={radius} stroke={colors.surfaceSunken} strokeWidth={STROKE} fill="none" />
      <Circle
        cx={RING / 2}
        cy={RING / 2}
        r={radius}
        stroke={colors.textMuted}
        strokeWidth={STROKE}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference * (1 - ratio)}
        transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
      />
    </Svg>
  );
}

/**
 * An achievement as a dashboard plaque: a bronze, silver or gold ring around its icon once unlocked;
 * a hollow ring with a progress arc while locked; "???" while secret. The tier is always written out,
 * so it never relies on colour alone, and unseen tiers get a NEW dot.
 */
export function DashPlaque({ achievement, isNew = false, onPress }: DashPlaqueProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const definition = achievementDefinition(achievement.id);
  const secret = achievement.isSecret && achievement.tier === 0;
  const title = secret ? t('achievements.secret_title') : t(`achievements.${achievement.id}.title`);
  const tierText = t(`progress.${tierKey(achievement.tier)}`);
  const target = achievement.nextThreshold;
  const progressText =
    target === undefined
      ? String(achievement.value)
      : t('progress.plaque_progress', { value: achievement.value, target });
  const baseLabel =
    target === undefined
      ? t('progress.plaque_label_maxed', { title, tier: tierText, value: achievement.value })
      : t('progress.plaque_label', { title, tier: tierText, value: achievement.value, target });
  const label = isNew ? `${baseLabel}. ${t('progress.plaque_new')}` : baseLabel;
  const tierName = achievement.tier === 1 ? 'bronze' : achievement.tier === 2 ? 'silver' : 'gold';
  const icon = secret ? 'help' : (definition?.icon ?? 'ribbon-outline');

  return (
    <Pressable
      onPress={onPress}
      disabled={onPress === undefined}
      accessibilityRole={onPress === undefined ? 'image' : 'button'}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.plaque, pressed && styles.pressed]}
      testID={`plaque-${achievement.id}`}
    >
      <View style={styles.ringBox}>
        {achievement.tier > 0 ? (
          <View style={styles.ring} testID={`plaque-${achievement.id}-${tierName}`}>
            <Gradient colors={plaqueTiers[tierName]} direction="diagonal" fill />
            <View style={styles.inner}>
              <Icon name={icon} size={26} />
            </View>
          </View>
        ) : (
          <View style={styles.lockedBox} testID={`plaque-${achievement.id}-locked`}>
            <ProgressRing ratio={plaqueRatio(achievement)} />
            <View style={styles.lockedIcon}>
              <Icon name={icon} size={24} tone="subtle" />
            </View>
          </View>
        )}
        {isNew && <View style={styles.newDot} testID={`plaque-${achievement.id}-new`} />}
      </View>
      <RNText style={styles.title} numberOfLines={2}>
        {title}
      </RNText>
      <RNText style={achievement.tier > 0 ? styles.tier : styles.tierLocked}>{tierText}</RNText>
      <RNText style={styles.progress} testID={`plaque-${achievement.id}-progress`}>
        {secret ? '—' : progressText}
      </RNText>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors, text, spacing, radii }) => ({
  plaque: {
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.md,
    minHeight: 48,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  ringBox: { width: RING, height: RING, marginBottom: spacing.xs },
  ring: {
    width: RING,
    height: RING,
    borderRadius: radii.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: RING - 2 * STROKE - 4,
    height: RING - 2 * STROKE - 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBox: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  lockedIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.signal,
    borderWidth: borders.strong,
    borderColor: colors.surface,
  },
  title: { ...text.label, color: colors.text, textAlign: 'center' },
  tier: { ...text.caption, color: colors.text, textAlign: 'center' },
  tierLocked: { ...text.caption, color: colors.textSubtle, textAlign: 'center' },
  progress: { ...text.numberSm, color: colors.textMuted, textAlign: 'center' },
}));
