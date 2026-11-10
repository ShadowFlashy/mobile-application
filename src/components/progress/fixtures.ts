import type { AchievementProgress, ChallengeProgress, StreakInfo, WeeklyChallenge } from '../../types/Progress';
import { levelForXp } from '../../utils/progression';

/**
 * Sample progression data for the progress stories and component tests (no network, no clock).
 * The week of these samples is 2026-W46, which ends on Monday 16 November 00:00 in Brussels.
 */
export const SAMPLE_WEEK_ENDS_AT = '2026-11-15T23:00:00.000Z';

export const sampleLevel = levelForXp(4210);

function board(
  slot: WeeklyChallenge['slot'],
  template: WeeklyChallenge['template'],
  params: WeeklyChallenge['params'],
  target: number,
  xp: number,
): WeeklyChallenge {
  return { id: `2026-W46:${slot}`, weekKey: '2026-W46', slot, template, params, target, xp };
}

export const sampleChallenges: ChallengeProgress[] = [
  {
    challenge: board('warmup', 'spots', {}, 4, 75),
    value: 4,
    isComplete: true,
    completedAt: '2026-11-10T12:00:00.000Z',
  },
  { challenge: board('main', 'collection', { collection: 'italian-exotics' }, 2, 125), value: 1, isComplete: false },
  { challenge: board('stretch', 'rarity_min', { rarity: 'epic' }, 1, 250), value: 0, isComplete: false },
];

export const sampleStreak: StreakInfo = {
  current: 6,
  best: 9,
  atRisk: true,
  lastWeeks: [false, false, true, true, true, true, true, false],
};

export const sampleAchievements: AchievementProgress[] = [
  { id: 'ignition', tier: 3, value: 37, isSecret: false, unlockedAt: { gold: '2026-10-02T10:00:00.000Z' } },
  {
    id: 'spotter',
    tier: 1,
    value: 37,
    nextThreshold: 50,
    isSecret: false,
    unlockedAt: { bronze: '2026-10-20T10:00:00.000Z' },
  },
  {
    id: 'collector',
    tier: 2,
    value: 30,
    nextThreshold: 48,
    isSecret: false,
    unlockedAt: { bronze: '2026-10-05T10:00:00.000Z', silver: '2026-11-08T10:00:00.000Z' },
  },
  { id: 'set_collector', tier: 0, value: 0, nextThreshold: 1, isSecret: false, unlockedAt: {} },
  {
    id: 'paint_shop',
    tier: 1,
    value: 4,
    nextThreshold: 6,
    isSecret: false,
    unlockedAt: { bronze: '2026-10-09T10:00:00.000Z' },
  },
  { id: 'redline', tier: 0, value: 30, nextThreshold: 118, isSecret: true, unlockedAt: {} },
];
