import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, spacing, useTheme } from '../../theme';
import type { PaintColor } from '../../types/CarModel';
import { Text } from '../primitives/Text';

export interface PaintValueProps {
  paint: PaintColor;
  testID?: string;
}

const DOT = 12;

/**
 * The paint value of a detail row: the paint's name with a small swatch before it, so the colour
 * is never the only cue. The swatch is decorative; `other` shows the name only.
 */
export function PaintValue({ paint, testID }: PaintValueProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.row} testID={testID ?? `paint-${paint}`}>
      {paint !== 'other' && (
        <View
          style={[styles.dot, { backgroundColor: theme.paint[paint] }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      )}
      <Text variant="body">{t(`paint.${paint}`)}</Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radii.pill,
    borderWidth: lines.hairline,
    borderColor: colors.line,
  },
}));
