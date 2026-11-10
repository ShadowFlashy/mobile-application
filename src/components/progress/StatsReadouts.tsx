import { useTranslation } from 'react-i18next';
import type { LevelInfo, StreakInfo } from '../../types/Progress';
import { Readout } from '../primitives/Readout';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { LevelReadout } from './LevelReadout';
import { StreakReadout } from './StreakReadout';

export interface StatsReadoutsProps {
  level: LevelInfo;
  /** Stickers collected and the catalogue size ("10/118"). */
  stickers: { collected: number; total: number };
  /** Number of spots logged. */
  spots: number;
  streak: StreakInfo;
  testID?: string;
}

/**
 * The Stats tab's four readouts on a timing-screen grid: LVL with the XP to the next level, the
 * stickers out of the catalogue, the spots logged and the weekly streak with its 8-week history.
 */
export function StatsReadouts({ level, stickers, spots, streak, testID = 'stats-readouts' }: StatsReadoutsProps) {
  const { t, i18n } = useTranslation();
  const format = (value: number) => new Intl.NumberFormat(i18n.language).format(value);
  const ratio = stickers.total > 0 ? Math.min(1, stickers.collected / stickers.total) : 0;
  const progressLabel = t('progress.stickers_progress_label', {
    collected: stickers.collected,
    total: stickers.total,
  });

  return (
    <Stack gap="lg" testID={testID}>
      <Row gap="lg" align="flex-start">
        <Stack flex={1}>
          <LevelReadout level={level} />
        </Stack>
        <Stack flex={1}>
          <Readout
            value={format(stickers.collected)}
            of={format(stickers.total)}
            meta={t('progress.stickers_meta', { percent: Math.round(ratio * 100) })}
            progress={ratio}
            progressLabel={progressLabel}
            accessibilityLabel={progressLabel}
            testID="stickers-readout"
          />
        </Stack>
      </Row>
      <Row gap="lg" align="flex-start">
        <Stack flex={1}>
          <Readout
            value={format(spots)}
            meta={t('progress.spots_meta', { count: spots })}
            accessibilityLabel={t('progress.spots_label', { count: spots })}
            testID="spots-readout"
          />
        </Stack>
        <Stack flex={1}>
          <StreakReadout streak={streak} />
        </Stack>
      </Row>
    </Stack>
  );
}
