import type { IconName } from '../components/primitives/Icon';
import type { CarCategory } from '../types/CarModel';

/**
 * Icon per car category. The labels are translated (course ch. 20):
 * t(`categories.${category}`) and t(`rarity.${rarity}`).
 */
export const CATEGORY_ICONS: Record<CarCategory, IconName> = {
  icon: 'star',
  sports: 'stats',
  supercar: 'bolt',
  hypercar: 'flame',
  classic: 'clock',
  jdm: 'sun',
  muscle: 'dumbbell',
  electric: 'battery',
};
