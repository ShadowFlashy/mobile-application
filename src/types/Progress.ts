import type { CarCategory, CarModel, PaintColor, Rarity } from './CarModel';
import type { Spot } from './Spot';
export const ALBUM_PAGE_IDS = [
  'icon',
  'sports',
  'supercar',
  'hypercar',
  'classic',
  'jdm',
  'muscle',
  'electric',
  'wildcards',
] as const;
export type AlbumPageId = (typeof ALBUM_PAGE_IDS)[number];
export const XP_KINDS = [
  'spot',
  'new_sticker',
  'duplicate',
  'fresh_paint',
  'wildcard',
  'page_complete',
  'album_complete',
  'challenge',
  'clean_sweep',
  'streak',
  'achievement',
  /** Appendix E: a themed collection completed (+250). */
  'set_complete',
] as const;
export type XpKind = (typeof XP_KINDS)[number];
export interface XpEntry {
  kind: XpKind;
  amount: number;
  /** ISO createdAt of the spot that earned it */ at: string;
  spotId: string;
  /** page, challenge or achievement id */ ref?: string;
}
export const LEVEL_TITLE_KEYS = [
  'learner',
  'kerbside_scout',
  'car_park_hunter',
  'meet_regular',
  'track_day_spotter',
  'paddock_pass',
  'pit_lane_pro',
  'works_spotter',
  'redline_legend',
] as const;
export type LevelTitleKey = (typeof LEVEL_TITLE_KEYS)[number];
export interface LevelInfo {
  level: number;
  titleKey: LevelTitleKey;
  xp: number;
  levelStartXp: number;
  nextLevelXp: number;
  /** 0..1 */ ratio: number;
}
export interface PageProgress {
  pageId: AlbumPageId;
  collected: number;
  total: number;
  isComplete: boolean;
  completedAt?: string;
}
/** Appendix E: progress of one themed collection (`Collection.id`). */
export interface SetProgress {
  collectionId: string;
  collected: number;
  total: number;
  isComplete: boolean;
  completedAt?: string;
}
export const ACHIEVEMENT_IDS = [
  'ignition',
  'spotter',
  'collector',
  'full_page',
  'legend_hunter',
  'paint_shop',
  'globetrotter',
  'wildcard',
  'regular',
  'pit_wall',
  'clean_plates',
  'logbook',
  'holy_trinity',
  'redline',
  /** Appendix E: complete themed collections [1, 4, 8]. */
  'set_collector',
] as const;
export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];
export type AchievementTier = 0 | 1 | 2 | 3;
export interface AchievementProgress {
  id: AchievementId;
  tier: AchievementTier;
  value: number;
  nextThreshold?: number;
  isSecret: boolean;
  unlockedAt: { bronze?: string; silver?: string; gold?: string };
}
export const CHALLENGE_SLOTS = ['warmup', 'main', 'stretch'] as const;
export type ChallengeSlot = (typeof CHALLENGE_SLOTS)[number];
export const CHALLENGE_TEMPLATE_IDS = [
  'spots',
  'notes',
  'wildcard',
  'new_stickers',
  'category',
  'distinct_pages',
  'paint',
  'country',
  'rarity_min',
  'same_make',
  /** Appendix E: "2 cars from {set}". */
  'collection',
] as const;
export type ChallengeTemplateId = (typeof CHALLENGE_TEMPLATE_IDS)[number];
export interface ChallengeParams {
  category?: CarCategory;
  paint?: PaintColor;
  country?: string;
  rarity?: Rarity;
  /** Appendix E: a collection id (template `collection`). */
  collection?: string;
}
export interface WeeklyChallenge {
  id: string;
  weekKey: string;
  slot: ChallengeSlot;
  template: ChallengeTemplateId;
  params: ChallengeParams;
  target: number;
  xp: number;
}
export interface ChallengeProgress {
  challenge: WeeklyChallenge;
  value: number;
  isComplete: boolean;
  completedAt?: string;
}
export interface StreakInfo {
  current: number;
  best: number;
  atRisk: boolean;
  /** last 8 weeks, oldest first, this week last */ lastWeeks: boolean[];
}
export interface ProgressSnapshot {
  xp: number;
  level: LevelInfo;
  ledger: XpEntry[];
  pages: PageProgress[];
  /** Appendix E: one entry per themed collection, in collection order. */
  sets: SetProgress[];
  achievements: AchievementProgress[];
  challenges: ChallengeProgress[];
  streak: StreakInfo;
  collectedIds: string[];
  paintsByModel: Record<string, PaintColor[]>;
  weekKey: string;
  weekEndsAt: string;
}
export const REVEAL_KINDS = ['new', 'duplicate', 'fresh_paint', 'wildcard'] as const;
export type RevealKind = (typeof REVEAL_KINDS)[number];
export interface RevealData {
  spot: Spot;
  model?: CarModel;
  kind: RevealKind;
  /** spots of this model so far, incl. this one */ count: number;
  entries: XpEntry[];
  xpGained: number;
  levelBefore: LevelInfo;
  levelAfter: LevelInfo;
  pagesCompleted: AlbumPageId[];
  /** Appendix E: collection ids this spot completed. */
  setsCompleted: string[];
  /** Appendix E: the collections this spot's model belongs to, as of this spot ("ITALIAN EXOTICS 3/10"). */
  sets: SetProgress[];
  achievementsUnlocked: { id: AchievementId; tier: AchievementTier }[];
  challengesCompleted: WeeklyChallenge[];
  pageId: AlbumPageId;
  /** 0..5 on a category page */ slotIndex?: number;
}
export const STAMP_KINDS = ['new', 'count', 'fresh_paint', 'wildcard', 'full_page', 'co_driver', 'one_to_go'] as const;
export type StampKind = (typeof STAMP_KINDS)[number];
