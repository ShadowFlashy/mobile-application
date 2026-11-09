import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import type { Rarity } from '../types/CarModel';
import { Badge } from './primitives/Badge';

interface RarityBadgeProps {
  rarity: Rarity;
}

/** Rarity of a car model as a coloured label; the colours follow light / dark mode. */
export function RarityBadge({ rarity }: RarityBadgeProps) {
  const { t } = useTranslation();
  const { rarity: rarityPalette } = useTheme();
  return (
    <Badge
      label={t(`rarity.${rarity}`)}
      backgroundColor={rarityPalette[rarity].background}
      textColor={rarityPalette[rarity].text}
      testID={`rarity-${rarity}`}
    />
  );
}
