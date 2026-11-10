import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, spacing, type TextTone } from '../../theme';
import type { OwnerCarStatus } from '../../utils/verificationCode';
import { Icon, type IconName } from '../primitives/Icon';
import { Text } from '../primitives/Text';

interface GarageStatusChipProps {
  status: OwnerCarStatus;
  testID?: string;
}

const ICONS: Record<OwnerCarStatus, IconName> = {
  pending: 'hourglass-outline',
  verified: 'shield-checkmark',
  paused: 'pause-circle-outline',
};

const TONES: Record<OwnerCarStatus, TextTone> = {
  pending: 'warning',
  verified: 'success',
  paused: 'muted',
};

/**
 * Verification status of a car: Pending verification, Verified owner or Pings paused. Shown with an
 * icon and a word, never by colour alone (SPEC §0.1 rule 12).
 */
export function GarageStatusChip({ status, testID }: GarageStatusChipProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const label = t(`garage.status_${status}`);
  return (
    <View style={[styles.chip, styles[status]]} testID={testID} accessible accessibilityLabel={label}>
      <Icon name={ICONS[status]} size={14} tone={TONES[status]} />
      <Text variant="label" tone={TONES[status]}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    minHeight: 24,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
  },
  pending: { backgroundColor: colors.warningSoft },
  verified: { backgroundColor: colors.successSoft },
  paused: { backgroundColor: colors.surfaceMuted },
}));
