import type { Rarity } from '../types/CarModel';

/** A sticker finish per rarity (SPEC §7.2): edge gradient stops, an optional wash and the pips. */
export interface Finish {
  name: 'matte' | 'chrome' | 'holo' | 'gold';
  edge: readonly string[];
  wash?: readonly string[];
  washOpacity: number;
  pips: 1 | 2 | 3 | 4;
  /** Only legendary stickers loop their sheen, and only on hero stickers. */
  sheenLoopOnHero: boolean;
}

const CHROME = ['#EEF1F4', '#AEB7C1', '#F7F9FB', '#8E99A6', '#DDE2E8'] as const;
const HOLO = ['#FF7AD9', '#8AF3FF', '#C6FF8A', '#FFE58A', '#B78CFF'] as const;
const GOLD = ['#8A6414', '#E8C25A', '#FFF3C4', '#C9971F', '#7A5410'] as const;

export const finishes: Record<Rarity, Finish> = {
  common: { name: 'matte', edge: ['#FFFFFF', '#F2F2F2'], washOpacity: 0, pips: 1, sheenLoopOnHero: false },
  rare: { name: 'chrome', edge: CHROME, washOpacity: 0, pips: 2, sheenLoopOnHero: false },
  epic: { name: 'holo', edge: HOLO, wash: HOLO, washOpacity: 0.18, pips: 3, sheenLoopOnHero: false },
  legendary: { name: 'gold', edge: GOLD, wash: GOLD, washOpacity: 0.18, pips: 4, sheenLoopOnHero: true },
};

export type PlaqueTier = 'bronze' | 'silver' | 'gold';

/** Dash-plaque tiers: bronze stops, silver = chrome stops, gold = gold stops. */
export const plaqueTiers: Record<PlaqueTier, readonly string[]> = {
  bronze: ['#8C5A2B', '#E0A96D', '#6E4220'],
  silver: CHROME,
  gold: GOLD,
};
