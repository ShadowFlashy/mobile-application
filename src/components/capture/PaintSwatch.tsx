import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { borders, createThemedStyles, radii, spacing, useTheme } from '../../theme';
import type { PaintColor } from '../../types/CarModel';
import { Icon } from '../primitives/Icon';
import { Text } from '../primitives/Text';

export type PaintSwatchSize = 'sm' | 'md';

export interface PaintSwatchProps {
  paint: PaintColor;
  size: PaintSwatchSize;
  selected?: boolean;
}

const DOT_SIZE: Record<PaintSwatchSize, number> = { sm: 20, md: 36 };

/**
 * A paint chip: a round swatch from the `paint` tokens plus its name, so paint is never shown by
 * colour alone. `other` shows a "?" glyph; the selected swatch gets a ring and a check mark.
 */
export function PaintSwatch({ paint, size, selected = false }: PaintSwatchProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();
  const dot = DOT_SIZE[size];
  const label = t(`paint.${paint}`);
  return (
    <View
      style={[styles.root, size === 'md' && styles.rootMd]}
      accessible
      accessibilityLabel={label}
      testID={`paint-${paint}`}
    >
      <View style={[styles.ring, selected && styles.ringSelected, { borderRadius: radii.pill }]}>
        <View
          style={[styles.dot, { width: dot, height: dot, backgroundColor: theme.paint[paint] }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {paint === 'other' && <Text variant="label">?</Text>}
          {selected && paint !== 'other' && (
            <Icon
              name="checkmark"
              size={size === 'md' ? 18 : 12}
              color={
                paint === 'white' || paint === 'yellow' || paint === 'beige' || paint === 'silver'
                  ? theme.colors.text
                  : theme.colors.onPrimary
              }
            />
          )}
        </View>
      </View>
      <Text variant={size === 'md' ? 'caption' : 'bodySm'} tone={selected ? 'default' : 'muted'} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  root: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rootMd: { flexDirection: 'column', gap: spacing.xxs, minWidth: 56 },
  ring: { padding: 3, borderWidth: borders.strong, borderColor: 'transparent' },
  ringSelected: { borderColor: colors.accent },
  dot: {
    borderRadius: radii.pill,
    borderWidth: borders.hairline,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
