import type { IconName } from '../components/primitives/Icon';
import type { CarCategory } from '../types/CarModel';
import type { AlbumPageId } from '../types/Progress';
import { CATEGORY_ICONS } from './carCategories';

export interface AlbumPageDefinition {
  id: AlbumPageId;
  /** Page number printed in the album (01–09). */
  number: number;
  /** The catalogue category shown on this page; undefined for the Wildcards page. */
  category?: CarCategory;
  icon: IconName;
}

/**
 * The album pages in print order (SPEC §4.4): one page per category, then Wildcards for every car
 * outside the catalogue. Pages are data-driven and variable-size (D-18): a page holds every model of
 * its category in sticker-number order. Titles are translated: t(`categories.${category}`).
 */
export const ALBUM_PAGES: readonly AlbumPageDefinition[] = [
  { id: 'icon', number: 1, category: 'icon', icon: CATEGORY_ICONS.icon },
  { id: 'sports', number: 2, category: 'sports', icon: CATEGORY_ICONS.sports },
  { id: 'supercar', number: 3, category: 'supercar', icon: CATEGORY_ICONS.supercar },
  { id: 'hypercar', number: 4, category: 'hypercar', icon: CATEGORY_ICONS.hypercar },
  { id: 'classic', number: 5, category: 'classic', icon: CATEGORY_ICONS.classic },
  { id: 'jdm', number: 6, category: 'jdm', icon: CATEGORY_ICONS.jdm },
  { id: 'muscle', number: 7, category: 'muscle', icon: CATEGORY_ICONS.muscle },
  { id: 'electric', number: 8, category: 'electric', icon: CATEGORY_ICONS.electric },
  { id: 'wildcards', number: 9, icon: 'help-circle-outline' },
];
