import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { borders, createThemedStyles, useTheme, type Theme } from '../../theme';
import type { StampKind } from '../../types/Progress';
import { Text } from '../primitives/Text';

export type StampBadgeSize = 'sm' | 'md';

export interface StampBadgeProps {
  kind: StampKind;
  /** The N of a ×N stamp. */
  count?: number;
  /** Default `md`; `sm` fits on small stickers. */
  size?: StampBadgeSize;
}

interface StampInk {
  background: string;
  text: string;
  border: string;
}

/** Ink per stamp kind, all from tokens (timing colours, marshal yellow, success, info, warning). */
function stampInk(kind: StampKind, { colors, instruments }: Theme): StampInk {
  switch (kind) {
    case 'new':
      return { background: instruments.timingPurple, text: colors.onPrimary, border: instruments.timingPurple };
    case 'count':
      return {
        background: instruments.timingYellow,
        text: instruments.timingYellowInk,
        border: instruments.timingYellowInk,
      };
    case 'fresh_paint':
      return { background: colors.successFill, text: colors.onPrimary, border: colors.successFill };
    case 'wildcard':
      return { background: colors.primary, text: colors.onPrimary, border: colors.primaryPressed };
    case 'full_page':
      return { background: colors.signal, text: colors.onSignal, border: colors.onSignal };
    case 'co_driver':
      return { background: colors.infoSoft, text: colors.info, border: colors.info };
    case 'one_to_go':
      return { background: colors.warningSoft, text: colors.warning, border: colors.warning };
  }
}

/** Stamps lean a little, like a rubber stamp pressed by hand. */
const STAMP_ROTATION = '-6deg';

/** A rubber stamp on a sticker or page: NEW, ×N, FRESH PAINT, WILDCARD, FULL PAGE, CO-DRIVER ✓, ONE TO GO. */
export function StampBadge({ kind, count, size = 'md' }: StampBadgeProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();
  const ink = stampInk(kind, theme);
  const label = kind === 'count' ? t('stamps.count', { count: count ?? 1 }) : t(`stamps.${kind}`);
  return (
    <View
      style={[
        styles.stamp,
        size === 'sm' ? styles.small : styles.medium,
        { backgroundColor: ink.background, borderColor: ink.border },
      ]}
      accessible
      accessibilityLabel={label}
      testID={`stamp-${kind}`}
    >
      <Text variant={size === 'sm' ? 'caption' : 'label'} color={ink.text} numberOfLines={1}>
        {size === 'sm' ? label.toUpperCase() : label}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ spacing, radii }) => ({
  stamp: {
    alignSelf: 'flex-start',
    borderWidth: borders.strong,
    borderRadius: radii.sm,
    transform: [{ rotate: STAMP_ROTATION }],
  },
  small: { paddingHorizontal: spacing.xs, paddingVertical: 0 },
  medium: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
}));
