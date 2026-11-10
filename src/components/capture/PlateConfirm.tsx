import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { borders, createThemedStyles, radii, spacing, touchTarget } from '../../theme';
import type { PlateConfirmation } from '../../types/Capture';
import { Icon } from '../primitives/Icon';
import { PressableScale } from '../primitives/PressableScale';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Text } from '../primitives/Text';
import { StyledButton } from '../StyledButton';

export interface PlateConfirmProps {
  /** Number of blur regions on the photo. */
  regionCount: number;
  /** The user's statement; undefined until they choose (it is reset on every region change). */
  confirmation?: PlateConfirmation;
  /** "No licence plate is visible" was chosen while Co-Driver suggested plates no box covers. */
  needsSecondTap: boolean;
  /** How many suggested plates are not covered. */
  ignoredCount: number;
  onConfirm: (confirmation: PlateConfirmation) => void;
  onConfirmIgnored: () => void;
  testID?: string;
}

interface OptionProps {
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onPress: () => void;
  testID: string;
}

function Option({ label, hint, checked, disabled = false, onPress, testID }: OptionProps) {
  const styles = useStyles();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={hint !== undefined ? `${label}. ${hint}` : label}
      checked={checked}
      disabled={disabled}
      testID={testID}
    >
      <View style={[styles.option, checked && styles.optionChecked]}>
        <Icon name={checked ? 'radio-button-on' : 'radio-button-off'} tone={checked ? 'accent' : 'muted'} />
        <Stack gap="xxs" flex={1}>
          <Text variant="bodyStrong">{label}</Text>
          {hint !== undefined && (
            <Text variant="caption" tone="muted">
              {hint}
            </Text>
          )}
        </Stack>
      </View>
    </PressableScale>
  );
}

/**
 * The explicit plate statement under the redacted preview (SPEC D-5, P0-04). Exactly two choices,
 * nothing pre-selected: "Every plate is blurred" (needs at least one box) or "No licence plate is
 * visible", which asks a second time when Co-Driver thinks it saw a plate.
 */
export function PlateConfirm({
  regionCount,
  confirmation,
  needsSecondTap,
  ignoredCount,
  onConfirm,
  onConfirmIgnored,
  testID = 'plate-confirm',
}: PlateConfirmProps) {
  const { t } = useTranslation();
  return (
    <Stack gap="sm" testID={testID}>
      <Text variant="label" tone="muted">
        {t('redactor.confirm_title')}
      </Text>
      <Option
        label={t('redactor.confirm_blurred')}
        hint={regionCount === 0 ? t('redactor.confirm_blurred_hint') : t('redactor.areas', { count: regionCount })}
        checked={confirmation === 'blurred'}
        disabled={regionCount === 0}
        onPress={() => onConfirm('blurred')}
        testID={`${testID}-blurred`}
      />
      <Option
        label={t('redactor.confirm_none')}
        checked={confirmation === 'none_visible'}
        onPress={() => onConfirm('none_visible')}
        testID={`${testID}-none`}
      />
      {needsSecondTap && (
        <Surface variant="sunken" padding="smd" testID={`${testID}-warning`}>
          <Stack gap="sm">
            <Row gap="xs" align="center">
              <Icon name="warning" tone="warning" size={18} />
              <Text variant="bodyStrong" tone="warning">
                {t('redactor.warning_title')}
              </Text>
            </Row>
            <Text variant="bodySm">{t('redactor.warning_body', { count: ignoredCount })}</Text>
            <StyledButton
              label={t('redactor.warning_confirm')}
              variant="secondary"
              onPress={onConfirmIgnored}
              testID={`${testID}-second-tap`}
            />
          </Stack>
        </Surface>
      )}
    </Stack>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  option: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingHorizontal: spacing.smd,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: borders.strong,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionChecked: { borderColor: colors.accent, backgroundColor: colors.primarySoft },
}));
