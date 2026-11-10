import { useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, ScrollView, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useHaptics } from '../../hooks/useHaptics';
import { createThemedStyles, easings, spacing, springs, touchTarget, useMotion } from '../../theme';
import type { AlbumPageData } from '../../types/Album';
import type { AchievementProgress, RevealData } from '../../types/Progress';
import {
  hasLevelUp,
  hasRewards,
  LED_STEP_MS,
  ledFrames,
  litLeds,
  revealStamp,
  revealTimeline,
  SHIFT_LIGHT_LEDS,
  tierName,
  type RevealPageProgress,
  type RevealSetProgress,
  type RevealStepId,
} from '../../utils/revealTimeline';
import { FoilSticker, type FoilStickerSize } from '../album/FoilSticker';
import { StampBadge } from '../album/StampBadge';
import { Icon } from '../primitives/Icon';
import { PressableScale } from '../primitives/PressableScale';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Text } from '../primitives/Text';
import { DashPlaque } from '../progress/DashPlaque';
import { LevelRoundel } from '../progress/LevelRoundel';
import { ShiftLights } from '../progress/ShiftLights';
import { LevelUpBanner } from './LevelUpBanner';
import { MiniPageStick } from './MiniPageStick';
import { RevealCtas } from './RevealCtas';
import { RevealProgressRow } from './RevealProgressRow';
import { StickerPacket } from './StickerPacket';
import { XpBreakdown } from './XpBreakdown';

export interface RevealStageProps {
  /** Everything the spot earned (useReveal). */
  reveal: RevealData;
  /** The album page the sticker goes on, for the STICK IT mini page (useAlbum().pageById). */
  page?: AlbumPageData;
  /** Page progress at this spot ("SUPERCARS 4/6"), from revealPageProgress. */
  pageProgress?: RevealPageProgress;
  /** Themed collections the car belongs to ("ITALIAN EXOTICS 3/10"), from revealSetProgress. */
  sets?: RevealSetProgress[];
  /** The snapshot's achievements, so unlocked plaques show their real progress. */
  achievements?: AchievementProgress[];
  onViewPage: () => void;
  onSpotAnother: () => void;
  /** Default `reveal-stage`. */
  testID?: string;
}

type Phase = 'playing' | 'stick' | 'sticking' | 'final';

const NO_SETS: RevealSetProgress[] = [];
/** Max width of the 'lg' FoilSticker shown as the reveal hero. */
const REVEAL_STICKER_MAX_WIDTH = 260;

/** Fades a section in (opacity and a short rise); with reduced motion it is simply there. */
function Appear({ children, duration, testID }: { children: ReactNode; duration: number; testID?: string }) {
  const { reduced, nativeDriver } = useMotion();
  const shown = useRef(new Animated.Value(reduced || duration === 0 ? 1 : 0)).current;
  useEffect(() => {
    if (reduced || duration === 0) {
      shown.setValue(1);
      return undefined;
    }
    const animation = Animated.timing(shown, {
      toValue: 1,
      duration,
      easing: easings.decelerate,
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [reduced, duration, nativeDriver, shown]);
  return (
    <Animated.View
      style={{
        opacity: shown,
        transform: [{ translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
      }}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
}

/** The sticker flips in from edge-on (tear/flip step). */
function FlipIn({ children }: { children: ReactNode }) {
  const styles = useStyles();
  const { reduced, duration, nativeDriver } = useMotion();
  const flip = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) {
      flip.setValue(1);
      return undefined;
    }
    const animation = Animated.timing(flip, {
      toValue: 1,
      duration: duration('flip'),
      easing: easings.decelerate,
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [reduced, duration, nativeDriver, flip]);
  return (
    <Animated.View
      style={[
        styles.flip,
        {
          opacity: flip.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] }),
          transform: [
            { perspective: 800 },
            { rotateY: flip.interpolate({ inputRange: [0, 1], outputRange: ['90deg', '0deg'] }) },
            { scale: flip.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** The rubber stamp slams onto the sticker with the stamp spring. */
function StampSlam({ children, testID }: { children: ReactNode; testID?: string }) {
  const styles = useStyles();
  const { reduced, nativeDriver } = useMotion();
  const slam = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) {
      slam.setValue(1);
      return undefined;
    }
    const animation = Animated.spring(slam, { toValue: 1, ...springs.stamp, useNativeDriver: nativeDriver });
    animation.start();
    return () => animation.stop();
  }, [reduced, nativeDriver, slam]);
  return (
    <Animated.View
      style={[
        styles.stamp,
        {
          opacity: slam.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 1] }),
          transform: [{ scale: slam.interpolate({ inputRange: [0, 1], outputRange: [2.4, 1] }) }, { rotate: '-8deg' }],
        },
      ]}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
}

/**
 * The sticker reveal ritual (SPEC P0-15, W7) on the always-dark stage:
 * packet → tear/flip → stamp → XP rows and odometer → shift lights (LED by LED) → SHIFT UP on a
 * level-up → page progress → set progress (Appendix E) → plaques and challenges → STICK IT into the
 * mini album page → View page / Spot another.
 *
 * The steps come from the pure `revealTimeline`. Skip is always there until the end and jumps to the
 * final state (`reveal-final`). With reduced motion every step appears at once with its final values
 * and only the STICK IT tap is left. Haptics (tear, stamp, shift-up, stick) respect the setting.
 */
export function RevealStage({
  reveal,
  page,
  pageProgress,
  sets = NO_SETS,
  achievements,
  onViewPage,
  onSpotAnother,
  testID = 'reveal-stage',
}: RevealStageProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { reduced, duration } = useMotion();
  const { play } = useHaptics();
  const insets = useContext(SafeAreaInsetsContext);
  const scrollRef = useRef<ScrollView>(null);

  const timeline = useMemo(() => revealTimeline(reveal, reduced, sets), [reveal, reduced, sets]);
  const [stepId, setStepId] = useState<RevealStepId>('packet');
  const [phase, setPhase] = useState<Phase>('playing');
  const [lit, setLit] = useState(() => litLeds(reveal.levelBefore.ratio));
  const playedHaptic = useRef<RevealStepId>();

  const indexOf = (id: RevealStepId) => timeline.findIndex((step) => step.id === id);
  const currentIndex = indexOf(stepId);
  const reached = (id: RevealStepId): boolean => {
    const index = indexOf(id);
    // Once the sequence waits for STICK IT (or later), every step has been shown.
    return index !== -1 && (phase !== 'playing' || index <= currentIndex);
  };
  const stepDuration = (id: RevealStepId): number =>
    phase === 'final' ? 0 : (timeline.find((step) => step.id === id)?.duration ?? 0);

  // Reduced motion: every step at once, only STICK IT is left.
  useEffect(() => {
    if (reduced && phase === 'playing') setStepId('stick');
  }, [reduced, phase]);

  // The step clock: play the step's haptic once, then move on after its animation and hold.
  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const index = timeline.findIndex((step) => step.id === stepId);
    const step = timeline[index];
    if (step === undefined) return undefined;
    if (step.awaitsTap) {
      setPhase('stick');
      return undefined;
    }
    if (step.haptic !== undefined && playedHaptic.current !== step.id) {
      playedHaptic.current = step.id;
      play(step.haptic);
    }
    const next = timeline[index + 1];
    if (next === undefined) return undefined;
    // Only ever move forward: a late timer must not rewind a jump (reduced motion, packet tap).
    const advance = () =>
      setStepId((previous) =>
        timeline.findIndex((candidate) => candidate.id === previous) < index + 1 ? next.id : previous,
      );
    const timer = setTimeout(advance, step.duration + step.hold);
    return () => clearTimeout(timer);
  }, [phase, stepId, timeline, play]);

  // Shift lights fill LED by LED; after SHIFT UP (or at the end) they show the new level's ratio.
  const levelUpReached = reached('levelUp');
  const finalLit = litLeds(reveal.levelAfter.ratio);
  useEffect(() => {
    if (phase === 'final' || reduced || levelUpReached) {
      setLit(finalLit);
      return undefined;
    }
    if (stepId !== 'shiftLights') return undefined;
    const frames = ledFrames(reveal);
    let next = 0;
    const timer = setInterval(() => {
      const value = frames[next];
      if (value === undefined) {
        clearInterval(timer);
        return;
      }
      setLit(value);
      next += 1;
    }, LED_STEP_MS);
    return () => clearInterval(timer);
  }, [phase, reduced, levelUpReached, stepId, reveal, finalLit]);

  // Keep the newest section in view while the sequence plays; the mini page sits at the top.
  const xpIndex = indexOf('xp');
  useEffect(() => {
    if (reduced) return;
    if (phase === 'sticking' || phase === 'final') {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (currentIndex > xpIndex) scrollRef.current?.scrollToEnd({ animated: true });
  }, [phase, currentIndex, xpIndex, reduced]);

  const openPacket = () => {
    if (phase === 'playing' && stepId === 'packet') setStepId('tear');
  };
  const skip = () => setPhase('final');
  const stick = () => {
    play('stick');
    setPhase(page !== undefined ? 'sticking' : 'final');
  };

  const stamp = revealStamp(reveal);
  const levelShown = levelUpReached ? reveal.levelAfter : reveal.levelBefore;
  const blink = hasLevelUp(reveal) && !levelUpReached && lit === SHIFT_LIGHT_LEDS && phase !== 'final';
  const carName =
    reveal.model !== undefined
      ? `${reveal.model.make} ${reveal.model.model}`
      : `${reveal.spot.make} ${reveal.spot.model}`.trim() || t('reveal.unknown_car');
  const pageId = reveal.pageId;
  const pageTitle = pageId === 'wildcards' ? t('reveal.wildcards') : t(`categories.${pageId}`);

  const sticker = (size: FoilStickerSize, stickerTestID?: string) => (
    <FoilSticker
      model={reveal.model}
      spot={reveal.spot}
      photoUrl={reveal.spot.photoUrl}
      photoPath={reveal.spot.photoPath}
      size={size}
      count={reveal.count}
      pageId={reveal.pageId}
      tiltSeed={reveal.spot.id}
      sheen={reduced || size === 'sm' ? 'none' : 'once'}
      testID={stickerTestID}
    />
  );

  const stampBadge = <StampBadge kind={stamp.kind} count={stamp.count} />;
  const showMiniPage = page !== undefined && (phase === 'sticking' || phase === 'final');

  let hero: ReactNode;
  if (showMiniPage) {
    hero = (
      <MiniPageStick
        page={page}
        highlightModelId={reveal.model?.id}
        slotIndex={reveal.slotIndex}
        sticker={sticker('sm')}
        animate={phase === 'sticking'}
        onStuck={() => setPhase('final')}
        testID="reveal-mini-page"
      />
    );
  } else if (!reached('tear')) {
    hero = <StickerPacket onOpen={openPacket} torn={false} season={reveal.model?.season} testID="reveal-packet" />;
  } else {
    hero = (
      <View style={styles.heroStack}>
        <FlipIn>
          <View style={styles.stickerWrap}>
            {sticker('lg', 'reveal-sticker')}
            {reached('stamp') && <StampSlam testID={`reveal-stamp-${stamp.kind}`}>{stampBadge}</StampSlam>}
          </View>
        </FlipIn>
        {stepId === 'tear' && phase === 'playing' && (
          <View style={styles.packetOver} pointerEvents="none">
            <StickerPacket onOpen={openPacket} torn season={reveal.model?.season} />
          </View>
        )}
      </View>
    );
  }

  const ctaPhase = phase === 'final' ? 'final' : phase === 'sticking' ? 'sticking' : 'stick';

  return (
    <View style={styles.stage} testID={testID}>
      <View style={[styles.topBar, { paddingTop: spacing.sm + (insets?.top ?? 0) }]}>
        <Row justify="space-between" gap="sm">
          <Text variant="label" tone="onStageMuted" numberOfLines={1}>
            {pageTitle}
          </Text>
          {phase !== 'final' && (
            <PressableScale
              onPress={skip}
              accessibilityLabel={t('reveal.skip')}
              accessibilityHint={t('reveal.skip_hint')}
              testID="reveal-skip"
            >
              <View style={styles.skip}>
                <Text variant="label" tone="onStage">
                  {t('reveal.skip')}
                </Text>
                <Icon name="play-skip-forward" size={18} tone="onStage" />
              </View>
            </PressableScale>
          )}
        </Row>
      </View>

      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content}>
        <Stack gap="lg" testID={phase === 'final' ? 'reveal-final' : 'reveal-playing'}>
          <View style={styles.hero}>{hero}</View>

          {reached('stamp') && (
            <Appear duration={stepDuration('stamp')}>
              <Stack gap="xxs" align="center">
                <Text variant="display" tone="onStage" align="center" heading>
                  {t(`reveal.headline.${reveal.kind}`)}
                </Text>
                <Text variant="headline" tone="onStage" align="center">
                  {carName}
                </Text>
                <Row gap="sm" justify="center" wrap>
                  <Text variant="bodySm" tone="onStageMuted" align="center">
                    {reveal.model !== undefined
                      ? t('reveal.sticker_line', {
                          number: String(reveal.model.stickerNumber).padStart(2, '0'),
                          rarity: t(`rarity.${reveal.model.rarity}`),
                        })
                      : t('reveal.wildcard_line')}
                  </Text>
                  {reveal.kind === 'duplicate' && (
                    <Text variant="bodySm" tone="onStageMuted">
                      {t('reveal.spotted_times', { times: reveal.count })}
                    </Text>
                  )}
                </Row>
                {showMiniPage && <View testID={`reveal-stamp-${stamp.kind}`}>{stampBadge}</View>}
              </Stack>
            </Appear>
          )}

          {reached('xp') && (
            <Appear duration={stepDuration('xp')}>
              <XpBreakdown
                entries={reveal.entries}
                total={reveal.xpGained}
                animate={phase === 'playing' && !reduced}
                testID="reveal-xp"
              />
            </Appear>
          )}

          {reached('shiftLights') && (
            <Appear duration={stepDuration('shiftLights') === 0 ? 0 : duration('base')}>
              <Stack gap="sm">
                <Row gap="md">
                  <LevelRoundel level={levelShown.level} size="sm" />
                  <Stack gap="xxs" flex={1}>
                    <Text variant="bodyStrong" tone="onStage">
                      {t('reveal.level_line', {
                        level: levelShown.level,
                        title: t(`reveal.titles.${levelShown.titleKey}`),
                      })}
                    </Text>
                    <Text variant="caption" tone="onStageMuted">
                      {t('reveal.xp_to_next', {
                        xp: Math.max(levelShown.nextLevelXp - reveal.levelAfter.xp, 0),
                        level: levelShown.level + 1,
                      })}
                    </Text>
                  </Stack>
                </Row>
                <ShiftLights
                  ratio={lit / SHIFT_LIGHT_LEDS}
                  leds={15}
                  blink={blink}
                  label={t('reveal.shift_lights_label', {
                    level: levelShown.level,
                    lit,
                    leds: SHIFT_LIGHT_LEDS,
                  })}
                  testID="reveal-shift-lights"
                />
              </Stack>
            </Appear>
          )}

          {reached('levelUp') && (
            <Appear duration={stepDuration('levelUp')}>
              <LevelUpBanner
                level={reveal.levelAfter.level}
                titleKey={reveal.levelAfter.titleKey}
                previousTitleKey={reveal.levelBefore.titleKey}
                testID="reveal-level-up"
              />
            </Appear>
          )}

          {reached('pageProgress') && pageProgress !== undefined && (
            <Appear duration={stepDuration('pageProgress')}>
              <RevealProgressRow
                target={{ kind: 'page', pageId: pageProgress.pageId }}
                collected={pageProgress.collected}
                total={pageProgress.total}
                justCompleted={pageProgress.justCompleted}
                testID="reveal-page-progress"
              />
            </Appear>
          )}

          {reached('sets') && sets.length > 0 && (
            <Appear duration={stepDuration('sets')} testID="reveal-sets">
              <Stack gap="md">
                <Text variant="label" tone="onStageMuted">
                  {t('reveal.sets_title')}
                </Text>
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
              </Stack>
            </Appear>
          )}

          {reached('rewards') && hasRewards(reveal) && (
            <Appear duration={stepDuration('rewards')} testID="reveal-rewards">
              <Surface variant="raised" radius="lg" padding="md">
                <Stack gap="md">
                  <Text variant="label" tone="muted">
                    {t('reveal.rewards_title')}
                  </Text>
                  {reveal.achievementsUnlocked.map(({ id, tier }) => {
                    const progress = achievements?.find((achievement) => achievement.id === id);
                    const tierKey = tierName(tier);
                    const name = t(`reveal.achievement_names.${id}`);
                    return (
                      <Row key={`${id}-${tier}`} gap="md" testID={`reveal-achievement-${id}`}>
                        <DashPlaque
                          achievement={{
                            id,
                            value: progress?.value ?? 0,
                            nextThreshold: progress?.nextThreshold,
                            isSecret: false,
                            unlockedAt: progress?.unlockedAt ?? {},
                            tier,
                          }}
                          isNew
                        />
                        <Stack flex={1} gap="xxs">
                          <Text variant="bodyStrong">{t('reveal.plaque_unlocked')}</Text>
                          <Text variant="bodySm" tone="muted">
                            {tierKey !== undefined
                              ? t('reveal.achievement_unlocked', { name, tier: t(`reveal.tiers.${tierKey}`) })
                              : name}
                          </Text>
                        </Stack>
                      </Row>
                    );
                  })}
                  {reveal.challengesCompleted.map((challenge) => (
                    <Row
                      key={challenge.id}
                      gap="sm"
                      justify="space-between"
                      testID={`reveal-challenge-${challenge.slot}`}
                    >
                      <Row gap="sm" flex={1}>
                        <Icon name="flag" size={20} />
                        <Text>{t('reveal.challenge_complete', { slot: t(`reveal.slots.${challenge.slot}`) })}</Text>
                      </Row>
                      <Text variant="numberSm" tone="success">
                        {t('reveal.xp_amount', { amount: challenge.xp })}
                      </Text>
                    </Row>
                  ))}
                </Stack>
              </Surface>
            </Appear>
          )}
        </Stack>
      </ScrollView>

      {phase !== 'playing' && (
        <View style={[styles.footer, { paddingBottom: spacing.smd + (insets?.bottom ?? 0) }]}>
          <View style={styles.footerInner}>
            <RevealCtas
              phase={ctaPhase}
              onStick={stick}
              onViewPage={onViewPage}
              onSpotAnother={onSpotAnother}
              testID="reveal-ctas"
            />
          </View>
        </View>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii, spacing }) => ({
  stage: { flex: 1, backgroundColor: colors.stage },
  topBar: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  skip: {
    minHeight: touchTarget,
    minWidth: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.smd,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.onStageMuted,
  },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: { minHeight: 300, alignItems: 'stretch', justifyContent: 'center' },
  // The hero sticker gets a real width: FoilSticker is width 100% (max 260), so a shrink-wrapping
  // parent would collapse it to its content.
  heroStack: { width: '100%', alignItems: 'stretch', justifyContent: 'center' },
  flip: { width: '100%' },
  stickerWrap: {
    width: '100%',
    maxWidth: REVEAL_STICKER_MAX_WIDTH + 2 * spacing.md,
    alignSelf: 'center',
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: spacing.md,
  },
  stamp: { position: 'absolute', top: 0, right: 0 },
  packetOver: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center' },
  footer: {
    backgroundColor: colors.stage,
    paddingTop: spacing.smd,
    paddingHorizontal: spacing.md,
  },
  footerInner: { width: '100%', maxWidth: 560, alignSelf: 'center' },
}));
