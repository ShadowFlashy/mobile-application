import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, radii, spacing, useTheme } from '../../theme';
import type { PaintColor } from '../../types/CarModel';
import { Text } from '../primitives/Text';

export type PaintSwatchSize = 'sm' | 'md';

export interface PaintSwatchProps {
  paint: PaintColor;
  size: PaintSwatchSize;
  /** @deprecated Selection is shown by the row that holds the swatch (a radio row). */
  selected?: boolean;
  /** Only the dot, for a row that already says the paint's name. Default false. */
  dotOnly?: boolean;
}

const DOT_SIZE: Record<PaintSwatchSize, number> = { sm: 14, md: 20 };

/**
 * A paint dot from the `paint` tokens (car paint is content, not decoration) with a hairline edge,
 * plus its name, so paint is never shown by colour alone. `other` shows a "?" in the dot.
 */
export function PaintSwatch({ paint, size, dotOnly = false }: PaintSwatchProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();
  const dot = DOT_SIZE[size];
  const label = t(`paint.${paint}`);
  const swatch = (
    <View
      style={[styles.dot, { width: dot, height: dot, backgroundColor: theme.paint[paint] }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {paint === 'other' && (
        <Text variant="mark" decorative>
          ?
        </Text>
      )}
    </View>
  );
  if (dotOnly) return swatch;
  return (
    <View style={styles.root} accessible accessibilityLabel={label} testID={`paint-${paint}`}>
      {swatch}
      <Text variant={size === 'md' ? 'body' : 'value'} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  root: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: {
    borderRadius: radii.pill,
    borderWidth: lines.hairline,
    borderColor: colors.text2,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
