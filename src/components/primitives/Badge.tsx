import { View, StyleSheet } from 'react-native';
import { createThemedStyles, radii, spacing, useTheme, type ThemeColors } from '../../theme';
import { Text } from './Text';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  /** Overrides the variant colours (e.g. rarity colours). */
  backgroundColor?: string;
  textColor?: string;
  testID?: string;
}

/** Text colour per variant: the strong tone that belongs to the variant's soft background. */
const textTokens: Record<BadgeVariant, keyof ThemeColors> = {
  default: 'textMuted',
  success: 'success',
  warning: 'warning',
  error: 'danger',
  info: 'info',
  primary: 'accent',
};

export function Badge({ label, variant = 'default', backgroundColor, textColor, testID }: BadgeProps) {
  const { colors } = useTheme();
  const variantStyles = useVariantStyles();
  return (
    <View
      style={[styles.base, variantStyles[variant], backgroundColor !== undefined && { backgroundColor }]}
      testID={testID}
    >
      <Text size="sm" weight="medium" color={textColor ?? colors[textTokens[variant]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 2,
    borderRadius: radii.pill,
  },
});

const useVariantStyles = createThemedStyles(({ colors }) => ({
  default: { backgroundColor: colors.surfaceMuted },
  success: { backgroundColor: colors.successSoft },
  warning: { backgroundColor: colors.warningSoft },
  error: { backgroundColor: colors.dangerSoft },
  info: { backgroundColor: colors.infoSoft },
  primary: { backgroundColor: colors.primarySoft },
}));
