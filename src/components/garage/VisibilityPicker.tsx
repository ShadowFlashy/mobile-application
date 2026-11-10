import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { borders, createThemedStyles, spacing, touchTarget } from '../../theme';
import { OWNER_VISIBILITIES, type OwnerVisibility } from '../../types/OwnerCar';
import { Icon, type IconName } from '../primitives/Icon';
import { InputField } from '../primitives/InputField';
import { PressableScale } from '../primitives/PressableScale';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';

export interface VisibilityPickerProps {
  value: OwnerVisibility;
  onChange: (visibility: OwnerVisibility) => void;
  /** Switching to Vanity plate needs the plate typed again: the plate field appears. */
  needsPlate?: boolean;
  plate?: string;
  onPlateChange?: (plate: string) => void;
  /** Translated message under the plate field. */
  plateError?: string;
  /** The car is not verified yet: spotters see nothing until it is. */
  isPending?: boolean;
  testID?: string;
}

const ICONS: Record<OwnerVisibility, IconName> = {
  hidden: 'eye-off-outline',
  badge: 'shield-checkmark-outline',
  vanity: 'id-card-outline',
};

/**
 * What spotters of the car may see: Hidden (default), Badge with the shout-out, or Vanity plate.
 * The selected option is marked by a check icon and bold text, not by colour alone.
 */
export function VisibilityPicker({
  value,
  onChange,
  needsPlate = false,
  plate = '',
  onPlateChange,
  plateError,
  isPending = false,
  testID = 'visibility-picker',
}: VisibilityPickerProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <Stack gap="sm" testID={testID}>
      <View accessibilityRole="radiogroup" accessibilityLabel={t('garage.visibility_title')} style={styles.group}>
        {OWNER_VISIBILITIES.map((option) => {
          const selected = option === value;
          const label = t(`garage.visibility_${option}`);
          const description = t(`garage.visibility_${option}_description`);
          return (
            <PressableScale
              key={option}
              onPress={() => onChange(option)}
              accessibilityRole="radio"
              accessibilityLabel={`${label}. ${description}`}
              checked={selected}
              testID={`visibility-option-${option}`}
            >
              <View style={[styles.option, selected && styles.optionSelected]}>
                <Icon name={ICONS[option]} size={22} tone={selected ? 'accent' : 'muted'} />
                <Stack gap="xxs" flex={1}>
                  <Text variant={selected ? 'bodyStrong' : 'body'}>{label}</Text>
                  <Text variant="bodySm" tone="muted">
                    {description}
                  </Text>
                </Stack>
                <Icon
                  name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  tone={selected ? 'accent' : 'subtle'}
                />
              </View>
            </PressableScale>
          );
        })}
      </View>
      {isPending && value !== 'hidden' && (
        <Text variant="bodySm" tone="muted" testID="visibility-pending-note">
          {t('garage.visibility_pending_note')}
        </Text>
      )}
      {value === 'vanity' && needsPlate && (
        <InputField
          label={t('garage.confirm_plate_label')}
          hint={t('garage.confirm_plate_hint')}
          value={plate}
          onChangeText={(text) => onPlateChange?.(text)}
          placeholder={t('garage.plate_placeholder')}
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={20}
          error={plateError}
          testID="visibility-plate-input"
        />
      )}
    </Stack>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  group: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    minHeight: touchTarget,
    padding: spacing.smd,
    borderRadius: radii.md,
    borderWidth: borders.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderWidth: borders.strong, borderColor: colors.accent, backgroundColor: colors.primarySoft },
}));
