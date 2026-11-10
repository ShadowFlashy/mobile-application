import type { CollectionId } from '../types/Collection';
import type { AlbumPageId } from '../types/Progress';

/**
 * Album page liveries (SPEC §7.2): generic colour pairs, not brand marks. The same in both schemes,
 * because paint is paint. Text on the base is at least 4.97:1.
 */
export interface Livery {
  base: string;
  stripe: string;
  text: string;
}

export const liveries: Record<AlbumPageId, Livery> = {
  icon: { base: '#F2B705', stripe: '#15171C', text: '#15171C' },
  sports: { base: '#8CC8EB', stripe: '#F47B20', text: '#15171C' },
  supercar: { base: '#D40000', stripe: '#FFD100', text: '#FFFFFF' },
  hypercar: { base: '#111111', stripe: '#C9A227', text: '#E3B63B' },
  classic: { base: '#0B4F35', stripe: '#EFE6CF', text: '#EFE6CF' },
  jdm: { base: '#3B1F6B', stripe: '#39D3B5', text: '#FFFFFF' },
  muscle: { base: '#1C3F94', stripe: '#FFFFFF', text: '#FFFFFF' },
  electric: { base: '#00C2A8', stripe: '#15171C', text: '#15171C' },
  wildcards: { base: '#E10600', stripe: '#15171C', text: '#FFFFFF' },
};

/**
 * Liveries of the themed collections (SPEC Appendix E): the same idea as the page liveries, one
 * generic colour pair per set, so a collection page and its SET COMPLETE stamp get their own paint.
 */
export const collectionLiveries: Record<CollectionId, Livery> = {
  'jdm-legends': { base: '#F5F5F0', stripe: '#BC002D', text: '#15171C' },
  'american-muscle': { base: '#1C3F94', stripe: '#B22234', text: '#FFFFFF' },
  'autobahn-heroes': { base: '#2B2D31', stripe: '#FFCC00', text: '#FFFFFF' },
  'italian-exotics': { base: '#A30000', stripe: '#009246', text: '#FFFFFF' },
  'british-icons': { base: '#004225', stripe: '#EFE6CF', text: '#EFE6CF' },
  'hot-hatch-heroes': { base: '#F47B20', stripe: '#15171C', text: '#15171C' },
  'electric-era': { base: '#0E7490', stripe: '#A3E635', text: '#FFFFFF' },
  'hypercar-hall-of-fame': { base: '#111111', stripe: '#C9A227', text: '#E3B63B' },
};
