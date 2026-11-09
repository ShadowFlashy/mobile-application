import type { IconName } from '../components/primitives/Icon';
import type { CarCategory } from '../types/CarModel';

/**
 * Icon per car category. The labels are translated (course ch. 20):
 * t(`categories.${category}`) and t(`rarity.${rarity}`).
 */
export const CATEGORY_ICONS: Record<CarCategory, IconName> = {
  icon: 'star-outline',
  sports: 'speedometer-outline',
  supercar: 'flash-outline',
  hypercar: 'rocket-outline',
  classic: 'hourglass-outline',
  jdm: 'sunny-outline',
  muscle: 'barbell-outline',
  electric: 'battery-charging-outline',
};
