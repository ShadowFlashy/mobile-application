import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import type { OwnerCarStatus } from '../../utils/verificationCode';
import { Icon, type AIconName } from '../primitives/Icon';
import { Text } from '../primitives/Text';

interface GarageStatusProps {
  status: OwnerCarStatus;
  testID?: string;
}

const ICONS: Record<OwnerCarStatus, AIconName> = {
  pending: 'clock',
  verified: 'check-circle',
  paused: 'pause',
};

/**
 * Verification status of a car as plain text with a small icon: Verified, Waiting for verification
 * or Pings paused. Never shown by colour: the word carries the meaning (SPEC §0.1 rule 12).
 */
export function GarageStatus({ status, testID }: GarageStatusProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const label = t(`garage.status_${status}`);
  return (
    <View style={styles.row} accessible accessibilityLabel={label} testID={testID}>
      <Icon name={ICONS[status]} size={16} tone={status === 'verified' ? 'text' : 'text2'} />
      <Text variant="body" tone={status === 'verified' ? 'text' : 'text2'} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
}));
