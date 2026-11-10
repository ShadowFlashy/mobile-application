import type { AlbumPageData, AlbumSlotData } from '../../types/Album';
import type { CarModel } from '../../types/CarModel';
import type { RevealData, RevealKind, XpEntry } from '../../types/Progress';
import type { Spot } from '../../types/Spot';
import { levelForXp } from '../../utils/progression';
import type { RevealPageProgress, RevealSetProgress } from '../../utils/revealTimeline';

/**
 * Example reveals for the RevealResult story and the reveal component tests (never imported by the
 * app). The star is the Ferrari 308 GTSi from the Italian Exotics set (Appendix E).
 */

const AT = '2026-11-10T14:12:00.000Z';

export const FERRARI_308: CarModel = {
  id: 'ferrari-308-gtsi',
  stickerNumber: 82,
  make: 'Ferrari',
  model: '308 GTSi',
  category: 'classic',
  rarity: 'epic',
  bodyStyle: 'coupe',
  country: 'IT',
  season: 1,
  yearFrom: 1980,
  yearTo: 1982,
};

const CLASSICS: CarModel[] = [
  {
    ...FERRARI_308,
    id: 'mercedes-300-sl',
    stickerNumber: 25,
    make: 'Mercedes-Benz',
    model: '300 SL',
    rarity: 'legendary',
    country: 'DE',
  },
  {
    ...FERRARI_308,
    id: 'citroen-2cv',
    stickerNumber: 26,
    make: 'Citroën',
    model: '2CV',
    rarity: 'common',
    country: 'FR',
  },
  FERRARI_308,
  {
    ...FERRARI_308,
    id: 'jaguar-e-type',
    stickerNumber: 27,
    make: 'Jaguar',
    model: 'E-Type',
    rarity: 'rare',
    country: 'GB',
  },
];

function spotOf(id: string, model: CarModel | undefined, overrides: Partial<Spot> = {}): Spot {
  return {
    id,
    userId: 'demo-user',
    carModelId: model?.id,
    make: model?.make ?? 'Lada',
    model: model?.model ?? 'Niva',
    photoPath: `demo-user/${id}.jpg`,
    city: 'Leuven',
    spottedAt: AT,
    createdAt: AT,
    paint: 'red',
    bodyStyle: model?.bodyStyle ?? 'suv',
    platesHidden: 1,
    identifiedBy: 'ai',
    aiConfidence: 0.94,
    shareNameWithOwner: false,
    ...overrides,
  };
}

export interface RevealFixtureOptions {
  kind?: RevealKind;
  levelUp?: boolean;
  /** The spot completes the Italian Exotics set (SET COMPLETE). */
  setComplete?: boolean;
  /** An achievement tier and a weekly challenge were won. */
  rewards?: boolean;
}

/** A complete RevealData for the given kind (new, duplicate, fresh_paint, wildcard). */
export function revealFixture({
  kind = 'new',
  levelUp = false,
  setComplete = false,
  rewards = false,
}: RevealFixtureOptions = {}): RevealData {
  const isWildcard = kind === 'wildcard';
  const model = isWildcard ? undefined : FERRARI_308;
  const spot = spotOf('spot-308', model);
  const entry = (kind: XpEntry['kind'], amount: number, ref?: string): XpEntry => ({
    kind,
    amount,
    at: AT,
    spotId: spot.id,
    ref,
  });

  const entries: XpEntry[] = [entry('spot', 10)];
  if (kind === 'new') entries.push(entry('new_sticker', 160));
  if (kind === 'duplicate') entries.push(entry('duplicate', 5));
  if (kind === 'fresh_paint') entries.push(entry('fresh_paint', 25));
  if (isWildcard) entries.push(entry('wildcard', 15));
  if (setComplete) entries.push(entry('set_complete', 250, 'italian-exotics'));
  if (rewards) {
    entries.push(entry('achievement', 250, 'ignition'));
    entries.push(entry('challenge', 125, '2026-W46-main'));
  }
  entries.push(entry('streak', 25));
  const xpGained = entries.reduce((sum, row) => sum + row.amount, 0);

  // A level-up crosses from level 5 into level 6 (1,500 XP, a new title); otherwise the spot stays
  // inside level 10 (4,500 to 5,500 XP).
  const before = levelUp ? 1500 - Math.min(xpGained, 400) : 4500;
  const italian = {
    collectionId: 'italian-exotics',
    collected: setComplete ? 12 : 3,
    total: 12,
    isComplete: setComplete,
  };

  return {
    spot,
    model,
    kind,
    count: kind === 'duplicate' ? 3 : kind === 'fresh_paint' ? 2 : 1,
    entries,
    xpGained,
    levelBefore: levelForXp(before),
    levelAfter: levelForXp(before + xpGained),
    pagesCompleted: [],
    setsCompleted: setComplete ? ['italian-exotics'] : [],
    sets: isWildcard ? [] : [italian],
    achievementsUnlocked: rewards ? [{ id: 'ignition', tier: 3 }] : [],
    challengesCompleted: rewards
      ? [
          {
            id: '2026-W46-main',
            weekKey: '2026-W46',
            slot: 'main',
            template: 'new_stickers',
            params: {},
            target: 1,
            xp: 125,
          },
        ]
      : [],
    pageId: isWildcard ? 'wildcards' : 'classic',
    slotIndex: isWildcard ? undefined : 2,
  };
}

/** The set rows RevealResult shows for a fixture (what revealSets returns). */
export function setsFixture(reveal: RevealData): RevealSetProgress[] {
  return reveal.sets.map((set, index) => ({
    id: 'italian-exotics',
    number: index + 4,
    collected: set.collected,
    total: set.total,
    isComplete: set.isComplete,
    justCompleted: reveal.setsCompleted.includes(set.collectionId),
  }));
}

/** Page progress for a fixture ("CLASSICS 3/4", or WILDCARDS ×2). */
export function pageProgressFixture(reveal: RevealData): RevealPageProgress {
  return reveal.pageId === 'wildcards'
    ? { pageId: 'wildcards', collected: 2, total: 0, isComplete: false, justCompleted: false }
    : { pageId: 'classic', collected: 3, total: CLASSICS.length, isComplete: false, justCompleted: false };
}

/** The album page the sticker goes on (the reveal shows its page number). */
export function pageFixture(reveal: RevealData): AlbumPageData {
  if (reveal.pageId === 'wildcards') {
    return {
      id: 'wildcards',
      number: 9,
      slots: [],
      wildcards: [reveal.spot],
      collected: 1,
      total: 0,
      isComplete: false,
    };
  }
  const collected = new Set(['mercedes-300-sl', 'ferrari-308-gtsi', 'jaguar-e-type']);
  const slots: AlbumSlotData[] = CLASSICS.map((model) => {
    const spots = collected.has(model.id)
      ? [model.id === FERRARI_308.id ? reveal.spot : spotOf(`spot-${model.id}`, model)]
      : [];
    return { model, spots, isCollected: spots.length > 0, cover: spots[0] };
  });
  return { id: 'classic', number: 5, slots, wildcards: [], collected: 3, total: slots.length, isComplete: false };
}
