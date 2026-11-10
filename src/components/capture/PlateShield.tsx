import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, radii, spacing } from '../../theme';
import type { PlateConfirmation } from '../../types/Capture';
import { Icon } from '../primitives/Icon';
import { Text } from '../primitives/Text';

export interface PlateShieldProps {
  /** Number of blurred regions. */
  count: number;
  confirmation?: PlateConfirmation;
  testID?: string;
}

/**
 * A small badge over the photo that says what will happen to the plates: "2 plates blurred on your
 * phone", "No plate visible", or "Plates not checked yet" until the user confirmed.
 */
export function PlateShield({ count, confirmation, testID = 'plate-shield' }: PlateShieldProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const label =
    confirmation === undefined
      ? t('redactor.shield_pending')
      : confirmation === 'none_visible'
        ? t('redactor.shield_none')
        : t('redactor.shield', { count });
  return (
    <View
      style={[styles.badge, confirmation !== undefined && styles.confirmed]}
      accessible
      accessibilityLabel={label}
      testID={testID}
    >
      <Icon name={confirmation === undefined ? 'shield-outline' : 'shield-checkmark'} size={16} tone="onStage" />
      <Text variant="caption" tone="onStage">
        {label}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.overlay,
  },
  confirmed: { backgroundColor: colors.successFill },
}));
