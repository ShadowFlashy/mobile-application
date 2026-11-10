import { View } from 'react-native';
import { createThemedStyles, spacing, useTheme, type ThemeColors } from '../../theme';
import { Text } from './Text';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
export type BadgeTone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'signal';

interface BadgeProps {
  label: string;
  /** @deprecated v1 name of `tone`; still supported. */
  variant?: BadgeVariant;
  /** Colour role (soft background with its strong text). Wins over `variant`. */
  tone?: BadgeTone;
  /** For components only (e.g. rarity colours): overrides the tone colours. */
  backgroundColor?: string;
  textColor?: string;
  testID?: string;
}

const VARIANT_TONES: Record<BadgeVariant, BadgeTone> = {
  default: 'default',
  success: 'success',
  warning: 'warning',
  error: 'danger',
  info: 'info',
  primary: 'accent',
};

/** Text colour per tone: the strong tone that belongs to the soft background. */
const TEXT_TOKENS: Record<BadgeTone, keyof ThemeColors> = {
  default: 'textMuted',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  accent: 'accent',
  signal: 'onSignal',
};

/** A small uppercase status label. */
export function Badge({ label, variant = 'default', tone, backgroundColor, textColor, testID }: BadgeProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const resolved = tone ?? VARIANT_TONES[variant];
  return (
    <View style={[styles.base, styles[resolved], backgroundColor !== undefined && { backgroundColor }]} testID={testID}>
      <Text variant="label" color={textColor ?? colors[TEXT_TOKENS[resolved]]}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radii.sm,
  },
  default: { backgroundColor: colors.surfaceMuted },
  success: { backgroundColor: colors.successSoft },
  warning: { backgroundColor: colors.warningSoft },
  danger: { backgroundColor: colors.dangerSoft },
  info: { backgroundColor: colors.infoSoft },
  accent: { backgroundColor: colors.primarySoft },
  signal: { backgroundColor: colors.signal },
}));
