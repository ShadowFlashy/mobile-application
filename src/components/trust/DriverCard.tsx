import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import { KerbStripe } from '../primitives/KerbStripe';
import { Tag } from '../primitives/Tag';
import { Text } from '../primitives/Text';
import { LevelRoundel } from '../progress/LevelRoundel';
import { ShiftLights } from '../progress/ShiftLights';

/** The driver's level as the progression engine derived it (SPEC §4.4). */
export interface DriverLevel {
  level: number;
  /** Already translated level title, e.g. "Kerbside Scout". */
  title: string;
  xp: number;
  /** XP needed for the next level, counted from 0. */
  nextLevelXp: number;
  /** Progress inside the current level, 0–1. */
  ratio: number;
}

export interface DriverCardProps {
  name: string;
  email?: string;
  /** Undefined while the progress is still being derived. */
  level?: DriverLevel;
  /** The app runs on the stored session without a connection: shows the read-only tag. */
  isOffline?: boolean;
  testID?: string;
}

/**
 * The Me tab's racing licence (SPEC P0-18): a kerb-striped night-session card with the level
 * roundel, the username, the level title and the XP to the next level on shift lights.
 */
export function DriverCard({ name, email, level, isOffline = false, testID }: DriverCardProps) {
  const { t, i18n } = useTranslation();
  const styles = useStyles();
  const number = new Intl.NumberFormat(i18n.language);
  const percent = new Intl.NumberFormat(i18n.language, { style: 'percent' });
  const ratio = level === undefined ? 0 : Math.min(Math.max(level.ratio, 0), 1);

  return (
    <View style={styles.card} testID={testID}>
      <KerbStripe height={4} />
      <View style={styles.body}>
        <View
          style={styles.identity}
          accessible
          accessibilityRole="header"
          accessibilityLabel={
            level === undefined ? name : t('profile.driver_a11y', { name, level: level.level, title: level.title })
          }
        >
          {level !== undefined && <LevelRoundel level={level.level} size="md" />}
          <View style={styles.names}>
            <Text variant="label" tone="onStageMuted">
              {level === undefined ? t('profile.driver_label') : t('profile.level_label', { level: level.level })}
            </Text>
            <Text variant="title" tone="onStage" numberOfLines={1} testID="driver-name">
              {name}
            </Text>
            {level !== undefined && (
              <Text variant="bodyStrong" tone="onStage" testID="driver-title">
                {level.title}
              </Text>
            )}
            {email !== undefined && email.length > 0 && (
              <Text variant="bodySm" tone="onStageMuted" numberOfLines={1}>
                {email}
              </Text>
            )}
          </View>
        </View>

        {level !== undefined ? (
          <View style={styles.progress}>
            <ShiftLights
              ratio={ratio}
              leds={15}
              label={t('profile.xp_progress_a11y', { next: level.level + 1, percent: percent.format(ratio) })}
              testID="driver-shift-lights"
            />
            <Text variant="caption" tone="onStageMuted" testID="driver-xp">
              {t('profile.xp_progress', {
                xp: number.format(level.xp),
                toNext: number.format(Math.max(0, level.nextLevelXp - level.xp)),
                next: level.level + 1,
              })}
            </Text>
          </View>
        ) : (
          <Text variant="caption" tone="onStageMuted">
            {t('profile.xp_loading')}
          </Text>
        )}

        {isOffline && (
          <View style={styles.tag}>
            <Tag
              label={t('profile.offline_tag')}
              icon="cloud-offline-outline"
              tone="auto"
              testID="offline-session-tag"
            />
          </View>
        )}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii, elevation }) => ({
  card: {
    backgroundColor: colors.stage,
    borderRadius: radii.sticker,
    overflow: 'hidden',
    ...elevation.raised,
  },
  body: { padding: spacing.md, gap: spacing.md },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  names: { flex: 1, gap: spacing.xxs },
  progress: { gap: spacing.xs },
  tag: { flexDirection: 'row' },
}));
