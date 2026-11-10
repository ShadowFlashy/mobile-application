import { useTranslation } from 'react-i18next';
import { Text as RNText, View } from 'react-native';
import { createThemedStyles } from '../../theme';
import type { LevelInfo } from '../../types/Progress';
import { LevelRoundel } from './LevelRoundel';
import { ShiftLights } from './ShiftLights';

export interface XpSummaryProps {
  level: LevelInfo;
  /** Blink the shift lights (a level-up just happened). */
  blink?: boolean;
  testID?: string;
}

/**
 * The driver's dash: the level roundel, the title, 15 shift lights towards the next level and
 * "4,210 XP · 290 to level 10". Always on the dark stage, like a real dashboard.
 */
export function XpSummary({ level, blink = false, testID = 'xp-summary' }: XpSummaryProps) {
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const format = (value: number) => new Intl.NumberFormat(i18n.language).format(value);
  const next = level.level + 1;
  const remaining = Math.max(0, level.nextLevelXp - level.xp);
  const percent = Math.round(Math.min(1, Math.max(0, level.ratio)) * 100);

  return (
    <View style={styles.dash} testID={testID}>
      <LevelRoundel level={level.level} size="lg" />
      <View style={styles.column}>
        <RNText style={styles.eyebrow}>{t('progress.level_label', { level: level.level })}</RNText>
        <RNText style={styles.title} testID={`${testID}-title`} maxFontSizeMultiplier={1.4}>
          {t(`levels.${level.titleKey}`)}
        </RNText>
        <ShiftLights
          ratio={level.ratio}
          leds={15}
          blink={blink}
          label={t('progress.shift_lights_label', { percent, next })}
          testID={`${testID}-lights`}
        />
        <RNText style={styles.xp} testID={`${testID}-xp`}>
          {t('progress.xp_to_next', { xp: format(level.xp), remaining: format(remaining), next })}
        </RNText>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, text, spacing, radii }) => ({
  dash: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.stage,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  column: { flex: 1, minWidth: 0, gap: spacing.xs },
  eyebrow: { ...text.label, color: colors.onStageMuted },
  title: { ...text.title, color: colors.onStage },
  xp: { ...text.numberSm, color: colors.onStage },
}));
