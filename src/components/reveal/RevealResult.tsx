import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, View } from 'react-native';
import { useHaptics } from '../../hooks/useHaptics';
import { easings, useMotion } from '../../theme';
import type { AlbumPageData } from '../../types/Album';
import type { RevealData } from '../../types/Progress';
import {
  hasLevelUp,
  hasRewards,
  REVEAL_ENTRANCE_MS,
  tierName,
  type RevealPageProgress,
  type RevealSetProgress,
} from '../../utils/revealTimeline';
import { ListRow } from '../primitives/ListRow';
import { Row } from '../primitives/Row';
import { Screen } from '../primitives/Screen';
import { Section } from '../primitives/Section';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { LevelReadout } from '../progress/LevelReadout';
import { StyledButton } from '../StyledButton';
import { RevealHero } from './RevealHero';
import { RevealProgressRow } from './RevealProgressRow';
import { XpBreakdown } from './XpBreakdown';

export interface RevealResultProps {
  /** Everything the spot earned (useReveal). */
  reveal: RevealData;
  /** The album page the sticker goes on (useAlbum().pageById), for its page number. */
  page?: AlbumPageData;
  /** Page progress at this spot ("Classics 3/4"), from revealPageProgress. */
  pageProgress?: RevealPageProgress;
  /** Themed collections the car belongs to ("Italian Exotics 3/12"), from revealSets. */
  sets?: RevealSetProgress[];
  /** "Done": to the album page with the new sticker. */
  onDone: () => void;
  onSpotAnother: () => void;
  /** Default `reveal-screen`. */
  testID?: string;
}

const NO_SETS: RevealSetProgress[] = [];
/** The short rise of the entrance, in dp. */
const RISE = 8;

/** The reveal's one entrance: a fade and a short rise (200 ms); with reduced motion it is simply there. */
function Entrance({ children }: { children: ReactNode }) {
  const { reduced, nativeDriver } = useMotion();
  const shown = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) {
      shown.stopAnimation();
      shown.setValue(1);
      return undefined;
    }
    const animation = Animated.timing(shown, {
      toValue: 1,
      duration: REVEAL_ENTRANCE_MS,
      easing: easings.decelerate,
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [reduced, nativeDriver, shown]);
  return (
    <Animated.View
      style={{
        opacity: shown,
        transform: [{ translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [RISE, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/**
 * The sticker reveal (SPEC P0-15) as one calm, confident result in direction A: the photo, the
 * sticker number in hero numerals with "New sticker", the car with its set and rarity roundel, the
 * page and set progress, the XP as hairline rows with a total that counts up, the level line, a plain
 * line on a level-up and what else was earned. "Done" (red, to the album page) and "Spot another".
 * One haptic plays when it appears (it respects the haptics setting).
 */
export function RevealResult({
  reveal,
  page,
  pageProgress,
  sets = NO_SETS,
  onDone,
  onSpotAnother,
  testID = 'reveal-screen',
}: RevealResultProps) {
  const { t } = useTranslation();
  const { reduced } = useMotion();
  const { play } = useHaptics();
  const played = useRef(false);
  const levelUp = hasLevelUp(reveal);

  useEffect(() => {
    if (played.current) return;
    played.current = true;
    play(levelUp ? 'shiftUp' : 'stamp');
  }, [play, levelUp]);

  const firstSet = sets[0];
  const pageTitle = reveal.pageId === 'wildcards' ? t('reveal.wildcards') : t(`categories.${reveal.pageId}`);
  const setTitle = firstSet !== undefined ? t(`collections.${firstSet.id}.title`) : pageTitle;
  const showProgress = pageProgress !== undefined || sets.length > 0;

  return (
    <Screen
      title={t('reveal.title')}
      meta={pageTitle}
      testID={testID}
      footer={
        <Row gap="smd">
          <Stack flex={1}>
            <StyledButton
              label={t('reveal.spot_another')}
              variant="secondary"
              onPress={onSpotAnother}
              testID="reveal-spot-another"
            />
          </Stack>
          <Stack flex={1}>
            <StyledButton
              label={t('reveal.done')}
              accessibilityHint={t('reveal.done_hint')}
              onPress={onDone}
              testID="reveal-done"
            />
          </Stack>
        </Row>
      }
    >
      <Entrance>
        <Stack gap="lg" testID="reveal-final">
          <RevealHero reveal={reveal} setTitle={setTitle} />

          {showProgress && (
            <Section title={t('reveal.album_title')} testID="reveal-progress">
              {pageProgress !== undefined && (
                <RevealProgressRow
                  target={{ kind: 'page', pageId: pageProgress.pageId }}
                  number={page?.number}
                  collected={pageProgress.collected}
                  total={pageProgress.total}
                  justCompleted={pageProgress.justCompleted}
                  testID="reveal-page-progress"
                />
              )}
              {sets.length > 0 && (
                <View testID="reveal-sets">
                  {sets.map((set) => (
                    <RevealProgressRow
                      key={set.id}
                      target={{ kind: 'set', collectionId: set.id }}
                      collected={set.collected}
                      total={set.total}
                      justCompleted={set.justCompleted}
                      testID={`reveal-set-${set.id}`}
                    />
                  ))}
                </View>
              )}
            </Section>
          )}

          <XpBreakdown entries={reveal.entries} total={reveal.xpGained} animate={!reduced} testID="reveal-xp" />

          <Stack gap="md" testID="reveal-level">
            {levelUp && (
              <View accessible accessibilityLiveRegion="polite" testID="reveal-level-up">
                <Text variant="heading">
                  {t('reveal.level_up', {
                    level: reveal.levelAfter.level,
                    title: t(`levels.${reveal.levelAfter.titleKey}`),
                  })}
                </Text>
              </View>
            )}
            <LevelReadout level={reveal.levelAfter} testID="reveal-level-readout" />
          </Stack>

          {hasRewards(reveal) && (
            <Section title={t('reveal.rewards_title')} testID="reveal-rewards">
              {reveal.achievementsUnlocked.map(({ id, tier }) => {
                const name = t(`achievements.${id}.title`);
                const tierKey = tierName(tier);
                return (
                  <ListRow
                    key={`${id}-${tier}`}
                    title={
                      tierKey !== undefined
                        ? t('reveal.achievement_unlocked', { name, tier: t(`reveal.tiers.${tierKey}`) })
                        : name
                    }
                    subtitle={t(`achievements.${id}.description`)}
                    testID={`reveal-achievement-${id}`}
                  />
                );
              })}
              {reveal.challengesCompleted.map((challenge) => (
                <ListRow
                  key={challenge.id}
                  title={t('reveal.challenge_complete', { slot: t(`reveal.slots.${challenge.slot}`) })}
                  trailing={
                    <Text variant="numS" tone="text2">
                      {t('reveal.xp_amount', { amount: challenge.xp })}
                    </Text>
                  }
                  testID={`reveal-challenge-${challenge.slot}`}
                />
              ))}
            </Section>
          )}
        </Stack>
      </Entrance>
    </Screen>
  );
}
