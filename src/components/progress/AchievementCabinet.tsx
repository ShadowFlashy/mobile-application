import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text as RNText, View } from 'react-native';
import { borders, createThemedStyles } from '../../theme';
import type { AchievementProgress } from '../../types/Progress';
import { formatDate } from '../../utils/formatDate';
import { DashPlaque } from './DashPlaque';

export interface AchievementCabinetProps {
  achievements: readonly AchievementProgress[];
  /** True for a plaque tier the user has not seen yet (the NEW dot). */
  isNew?: (achievement: AchievementProgress) => boolean;
  /** Called when a plaque is opened (e.g. to mark it seen). */
  onOpen?: (achievement: AchievementProgress) => void;
  testID?: string;
}

/** The latest unlock date of a plaque (gold, else silver, else bronze). */
function lastUnlock(achievement: AchievementProgress): string | undefined {
  const { gold, silver, bronze } = achievement.unlockedAt;
  return gold ?? silver ?? bronze;
}

/**
 * The trophy cabinet: dash plaques in 3 columns. Tapping a plaque opens its details underneath
 * (description, unlock date, next threshold).
 */
export function AchievementCabinet({
  achievements,
  isNew,
  onOpen,
  testID = 'achievement-cabinet',
}: AchievementCabinetProps) {
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const [openId, setOpenId] = useState<string | undefined>(undefined);
  const open = achievements.find((achievement) => achievement.id === openId);

  const unlocked = open === undefined ? undefined : lastUnlock(open);
  const secret = open !== undefined && open.isSecret && open.tier === 0;

  return (
    <View style={styles.cabinet} testID={testID}>
      <View style={styles.grid}>
        {achievements.map((achievement) => (
          <View key={achievement.id} style={styles.cell}>
            <DashPlaque
              achievement={achievement}
              isNew={isNew?.(achievement) ?? false}
              onPress={() => {
                setOpenId((current) => (current === achievement.id ? undefined : achievement.id));
                onOpen?.(achievement);
              }}
            />
          </View>
        ))}
      </View>
      {open !== undefined && (
        <View style={styles.details} testID={`${testID}-details`} accessibilityLiveRegion="polite">
          <RNText style={styles.detailsTitle}>
            {secret ? t('achievements.secret_title') : t(`achievements.${open.id}.title`)}
          </RNText>
          <RNText style={styles.detailsText}>
            {secret ? t('achievements.secret_description') : t(`achievements.${open.id}.description`)}
          </RNText>
          {unlocked !== undefined && (
            <RNText style={styles.detailsMeta}>
              {t('progress.plaque_unlocked', { date: formatDate(unlocked, i18n.language) })}
            </RNText>
          )}
          {open.nextThreshold !== undefined && !secret && (
            <RNText style={styles.detailsMeta}>{t('progress.plaque_next', { target: open.nextThreshold })}</RNText>
          )}
        </View>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, text, spacing, radii }) => ({
  cabinet: { gap: spacing.smd },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '33.333%', padding: spacing.xxs },
  details: {
    backgroundColor: colors.surface,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  detailsTitle: { ...text.title, color: colors.text },
  detailsText: { ...text.body, color: colors.text },
  detailsMeta: { ...text.bodySm, color: colors.textMuted },
}));
