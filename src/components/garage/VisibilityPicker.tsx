import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import { OWNER_VISIBILITIES, type OwnerVisibility } from '../../types/OwnerCar';
import { InputField } from '../primitives/InputField';
import { Radio } from '../primitives/Radio';
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

/**
 * What spotters of the car may see: Hidden (default), Badge with the shout-out, or Vanity plate, as
 * radio rows on hairlines. Selected = a filled ring in the text colour, announced as checked.
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
    <View testID={testID}>
      <View accessibilityRole="radiogroup" accessibilityLabel={t('garage.visibility_title')}>
        {OWNER_VISIBILITIES.map((option) => (
          <Radio
            key={option}
            label={t(`garage.visibility_${option}`)}
            description={t(`garage.visibility_${option}_description`)}
            value={option}
            selected={option === value}
            onSelect={() => onChange(option)}
            testID={`visibility-option-${option}`}
          />
        ))}
      </View>
      {isPending && value !== 'hidden' && (
        <View style={styles.note}>
          <Text variant="meta" tone="text2" testID="visibility-pending-note">
            {t('garage.visibility_pending_note')}
          </Text>
        </View>
      )}
      {value === 'vanity' && needsPlate && (
        <View style={styles.field}>
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
        </View>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  note: { paddingTop: spacing.smd },
  field: { paddingTop: spacing.md },
}));
