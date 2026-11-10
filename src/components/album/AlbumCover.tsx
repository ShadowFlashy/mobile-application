import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { createThemedStyles } from '../../theme';
import type { AlbumCoverData } from '../../types/Album';
import type { CarModel } from '../../types/CarModel';
import type { ChallengeProgress } from '../../types/Progress';
import type { Spot } from '../../types/Spot';
import { pageIdOfModel } from '../../utils/album';
import { KerbStripe } from '../primitives/KerbStripe';
import { Surface } from '../primitives/Surface';
import { Text } from '../primitives/Text';
import { LevelRoundel } from '../progress/LevelRoundel';
import { PitBoard } from '../progress/PitBoard';
import { OdometerCounter } from '../reveal/OdometerCounter';
import { FoilSticker } from './FoilSticker';
import { TachoGauge } from './TachoGauge';

export interface AlbumCoverProps {
  cover: AlbumCoverData;
  /** Season of the catalogue (Season 1). */
  season?: number;
  /** Driver level from the progression engine; hidden while it is unknown. */
  level?: number;
  /** This week's teaser pit board (the main challenge). */
  challenge?: ChallengeProgress;
  weekEndsAt?: string;
  /** Looks up the catalogue model of a latest catch (undefined = wildcard). */
  modelOf?: (spot: Spot) => CarModel | undefined;
  onPressLatest?: (spot: Spot) => void;
  testID?: string;
}

/**
 * The album cover: REDLINE · SEASON 1 · n STICKERS, a tacho of completion with its red zone, the
 * odometer "x/n", the level roundel, this week's pit board and the newest catches.
 */
export function AlbumCover({
  cover,
  season = 1,
  level,
  challenge,
  weekEndsAt,
  modelOf,
  onPressLatest,
  testID = 'album-cover',
}: AlbumCoverProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const percent = Math.round(cover.ratio * 100);

  return (
    <Surface variant="raised" radius="lg" testID={testID}>
      <KerbStripe height={8} />
      <View style={styles.body}>
        <View
          accessible
          accessibilityLabel={t('album.cover_label', { collected: cover.collected, total: cover.total })}
          testID={`${testID}-summary`}
        >
          <Text variant="label" tone="accent">
            {t('album.cover_eyebrow', { season, count: cover.total })}
          </Text>
        </View>
        <View style={styles.instruments}>
          <TachoGauge
            ratio={cover.ratio}
            label={t('album.tacho_label')}
            valueLabel={t('album.tacho_value', { percent })}
            size="lg"
            testID="album-tacho"
          />
          <View style={styles.readouts}>
            <View>
              <OdometerCounter
                value={cover.collected}
                suffix={t('album.odometer_suffix', { total: cover.total })}
                testID="album-cover-count"
              />
              <Text variant="caption" tone="muted">
                {t('album.stickers_caption')}
              </Text>
            </View>
            {level !== undefined && (
              <View style={styles.level}>
                <LevelRoundel level={level} size="md" />
                <Text variant="caption" tone="muted">
                  {t('album.level_caption')}
                </Text>
              </View>
            )}
          </View>
        </View>
        {challenge !== undefined && weekEndsAt !== undefined && (
          <View style={styles.section} testID="album-cover-pitboard">
            <Text variant="label" tone="muted">
              {t('album.this_week')}
            </Text>
            <PitBoard challenge={challenge} endsAt={weekEndsAt} compact />
          </View>
        )}
        {cover.latest.length > 0 && (
          <View style={styles.section}>
            <Text variant="label" tone="muted">
              {t('album.latest_title')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.latest}
              testID="album-latest"
            >
              {cover.latest.map((spot) => {
                const model = modelOf?.(spot);
                return (
                  <View key={spot.id} style={styles.latestItem}>
                    <FoilSticker
                      model={model}
                      spot={spot}
                      size="sm"
                      stamp={model === undefined ? 'wildcard' : undefined}
                      pageId={model !== undefined ? pageIdOfModel(model) : 'wildcards'}
                      tiltSeed={spot.id}
                      sheen="none"
                      onPress={onPressLatest !== undefined ? () => onPressLatest(spot) : undefined}
                      testID={`latest-${spot.id}`}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </Surface>
  );
}

const useStyles = createThemedStyles(({ spacing }) => ({
  body: { padding: spacing.md, gap: spacing.md },
  instruments: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  readouts: { flex: 1, minWidth: 120, gap: spacing.md },
  level: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  section: { gap: spacing.sm },
  latest: { gap: spacing.smd, paddingVertical: spacing.xs },
  latestItem: { width: 104 },
}));
