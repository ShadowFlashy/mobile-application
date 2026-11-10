import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, finishes, useTheme } from '../../theme';
import type { Rarity } from '../../types/CarModel';

export type RarityPipsSize = 'sm' | 'md';

export interface RarityPipsProps {
  rarity: Rarity;
  size: RarityPipsSize;
  /** For components only: pip colour on a coloured background (e.g. a sticker tab). */
  color?: string;
}

const MAX_PIPS = 4;
const PIP_SIZE: Record<RarityPipsSize, number> = { sm: 5, md: 7 };

/**
 * 1–4 diamond pips out of 4, so rarity is never shown by colour alone. The empty pips stay as
 * outlines; the accessible label names the rarity.
 */
export function RarityPips({ rarity, size, color }: RarityPipsProps) {
  const { t } = useTranslation();
  const { rarity: palette } = useTheme();
  const styles = useStyles();
  const filled = finishes[rarity].pips;
  const ink = color ?? palette[rarity].text;
  const dimension = PIP_SIZE[size];
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t(`rarity.${rarity}`)}
      testID={`rarity-pips-${rarity}`}
    >
      {Array.from({ length: MAX_PIPS }, (_, index) => (
        <View
          key={index}
          style={[
            styles.pip,
            { width: dimension, height: dimension, borderColor: ink },
            index < filled ? { backgroundColor: ink } : styles.empty,
          ]}
          testID={index < filled ? 'rarity-pip-filled' : 'rarity-pip-empty'}
        />
      ))}
    </View>
  );
}

const useStyles = createThemedStyles(({ spacing }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs + 1 },
  pip: { borderWidth: 1, transform: [{ rotate: '45deg' }], borderRadius: 1 },
  empty: { opacity: 0.45 },
}));
