import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import type { AlbumCoverData } from '../../types/Album';
import type { LevelInfo } from '../../types/Progress';
import { Readout } from '../primitives/Readout';

export interface AlbumTotalsProps {
  cover: AlbumCoverData;
  /** Season of the catalogue (Season 1). */
  season?: number;
  /** Level from the progression engine; the LVL readout is hidden while it is unknown. */
  level?: LevelInfo;
  testID?: string;
}

/**
 * The album's two readouts, side by side on one baseline: "10/118 · Stickers · 8% of Season 1"
 * and "LVL 8 · 585 XP to level 9", each with its 2 px progress line.
 */
export function AlbumTotals({ cover, season = 1, level, testID = 'album-cover' }: AlbumTotalsProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const percent = Math.round(cover.ratio * 100);
  const next = level !== undefined ? level.level + 1 : 0;
  const remaining = level !== undefined ? Math.max(0, level.nextLevelXp - level.xp) : 0;
  const levelPercent = level !== undefined ? Math.round(Math.min(1, Math.max(0, level.ratio)) * 100) : 0;

  return (
    <View style={styles.row} testID={testID}>
      <View style={styles.total}>
        <Readout
          size="hero"
          value={String(cover.collected)}
          of={String(cover.total)}
          meta={t('album.total_meta', { percent, season })}
          progress={cover.ratio}
          progressLabel={t('album.total_progress_label', { percent })}
          accessibilityLabel={t('album.cover_label', { collected: cover.collected, total: cover.total })}
          testID={`${testID}-summary`}
        />
      </View>
      {level !== undefined && (
        <View style={styles.level}>
          <Readout
            unit={t('album.lvl')}
            value={String(level.level)}
            meta={t('album.level_meta', { xp: remaining, next })}
            progress={level.ratio}
            progressLabel={t('album.level_progress_label', { percent: levelPercent, next })}
            accessibilityLabel={t('album.level_label', { level: level.level })}
            testID={`${testID}-level`}
          />
        </View>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.lg },
  // The mockup splits the 350 px column 210 : 116.
  total: { flex: 9, minWidth: 0 },
  level: { flex: 5, minWidth: 0 },
}));
