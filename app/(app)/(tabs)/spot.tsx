import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';
import { CarModelPicker } from '../../../src/components/CarModelPicker';
import { PlateRedactor } from '../../../src/components/PlateRedactor';
import { Checkbox, InputField, Row, Screen, Stack, Text } from '../../../src/components/primitives';
import { PrivacyNotice } from '../../../src/components/PrivacyNotice';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { StepIndicator } from '../../../src/components/StepIndicator';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useCarModels } from '../../../src/hooks/useCarModels';
import { useSpotWizard, type WizardStep } from '../../../src/hooks/useSpotWizard';
import { useToastStore } from '../../../src/state/useToastStore';
import { createThemedStyles, radii, useTheme } from '../../../src/theme';
import type { CarModel } from '../../../src/types/CarModel';
import type { RedactedPhoto } from '../../../src/types/Spot';
import type { ValidationKey } from '../../../src/utils/validation';

const STEP_INDEX: Record<WizardStep, number> = { photo: 0, privacy: 1, details: 2 };
/** Stable empty catalogue while the car models are still loading. */
const NO_MODELS: CarModel[] = [];
const FALLBACK_ASPECT_RATIO = 4 / 3;

function aspectRatioOf(photo: RedactedPhoto): number {
  return photo.width > 0 && photo.height > 0 ? photo.width / photo.height : FALLBACK_ASPECT_RATIO;
}

/** "Spot a car": photo → hide the licence plates → details. The logic lives in useSpotWizard. */
export default function SpotScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const wizard = useSpotWizard();
  const carModels = useCarModels().data ?? NO_MODELS;
  const showToast = useToastStore((state) => state.show);

  const steps = [t('spot.step_photo'), t('spot.step_hide_plates'), t('spot.step_details')];
  const hasRegions = wizard.regions.length > 0;
  const errorText = (key?: ValidationKey): string | undefined =>
    key !== undefined ? t(`validation.${key}`) : undefined;

  const onSave = async () => {
    const result = await wizard.save();
    if (result === undefined) return;
    showToast(result.isNewSticker ? t('spot.saved_new_sticker') : t('spot.saved'), 'success');
    router.push(routes.spotDetail(result.spot.id));
  };

  return (
    <Screen testID="spot-screen">
      <Stack gap="lg">
        <ScreenHeader title={t('spot.title')} subtitle={t('spot.subtitle')} />
        <StepIndicator steps={steps} currentIndex={STEP_INDEX[wizard.step]} />

        {wizard.errorMessage !== undefined && (
          <Text color={colors.danger} testID="spot-error">
            {wizard.errorMessage}
          </Text>
        )}

        {wizard.step === 'photo' && (
          <Stack gap="md">
            <StyledButton
              label={t('spot.take_photo')}
              icon="camera"
              onPress={() => void wizard.pickPhoto('camera')}
              isLoading={wizard.isBusy}
              testID="take-photo-button"
            />
            <StyledButton
              label={t('spot.choose_from_gallery')}
              icon="images-outline"
              variant="secondary"
              onPress={() => void wizard.pickPhoto('library')}
              disabled={wizard.isBusy}
              testID="choose-photo-button"
            />
            <PrivacyNotice title={t('spot.privacy_title')}>{t('spot.privacy_body')}</PrivacyNotice>
          </Stack>
        )}

        {wizard.step === 'privacy' && wizard.photo !== undefined && (
          <Stack gap="md">
            <Text weight="medium">{t('spot.drag_instruction')}</Text>
            <PlateRedactor
              photo={wizard.photo}
              regions={wizard.regions}
              onAddRegion={wizard.addRegion}
              testID="plate-redactor"
            />
            {/* wrap: longer translations move the buttons to the next line instead of overflowing */}
            <Row gap="sm" justify="space-between" wrap>
              <Text size="sm" color={hasRegions ? colors.accent : colors.textMuted} testID="hidden-areas-count">
                {t('spot.areas_blurred', { count: wizard.regions.length })}
              </Text>
              <Row gap="xs">
                <StyledButton
                  label={t('spot.undo')}
                  variant="ghost"
                  icon="arrow-undo-outline"
                  onPress={wizard.undoRegion}
                  disabled={!hasRegions}
                  testID="undo-region-button"
                />
                <StyledButton
                  label={t('spot.clear')}
                  variant="ghost"
                  onPress={wizard.clearRegions}
                  disabled={!hasRegions}
                  testID="clear-regions-button"
                />
              </Row>
            </Row>
            <Checkbox
              label={t('spot.no_plate_visible')}
              checked={wizard.noPlateVisible}
              onChange={wizard.setNoPlateVisible}
              disabled={hasRegions}
              testID="no-plate-checkbox"
            />
            <StyledButton
              label={t('spot.blur_and_continue')}
              icon="eye-off-outline"
              onPress={() => void wizard.confirmPrivacy()}
              disabled={!wizard.canConfirmPrivacy}
              isLoading={wizard.isBusy}
              accessibilityHint={t('spot.blur_hint')}
              testID="confirm-privacy-button"
            />
            <StyledButton
              label={t('spot.choose_another_photo')}
              variant="ghost"
              onPress={wizard.goBack}
              testID="restart-button"
            />
          </Stack>
        )}

        {wizard.step === 'details' && wizard.redactedPhoto !== undefined && (
          <Stack gap="md">
            {/* The redacted photo is still on the device: the core Image is enough, no cache key needed. */}
            <Image
              source={{ uri: wizard.redactedPhoto.uri }}
              style={[styles.preview, { aspectRatio: aspectRatioOf(wizard.redactedPhoto) }]}
              resizeMode="cover"
              accessible
              accessibilityRole="image"
              accessibilityLabel={t('spot.preview_label')}
              testID="redacted-preview"
            />
            <CarModelPicker
              models={carModels}
              selectedId={wizard.form.carModelId}
              onSelect={wizard.selectModel}
              isOtherSelected={wizard.form.carModelId === undefined}
            />
            {wizard.form.carModelId === undefined && (
              <Stack gap="md">
                <InputField
                  label={t('spot.make_label')}
                  value={wizard.form.make}
                  onChangeText={(value) => wizard.updateField('make', value)}
                  placeholder={t('spot.make_placeholder')}
                  autoCapitalize="words"
                  error={errorText(wizard.errors.make)}
                  maxLength={40}
                  testID="make-input"
                />
                <InputField
                  label={t('spot.model_label')}
                  value={wizard.form.model}
                  onChangeText={(value) => wizard.updateField('model', value)}
                  placeholder={t('spot.model_placeholder')}
                  autoCapitalize="words"
                  error={errorText(wizard.errors.model)}
                  maxLength={60}
                  testID="model-input"
                />
              </Stack>
            )}
            <InputField
              label={t('spot.location_label')}
              value={wizard.form.locationLabel}
              onChangeText={(value) => wizard.updateField('locationLabel', value)}
              placeholder={t('spot.location_placeholder')}
              autoCapitalize="sentences"
              hint={t('spot.location_hint')}
              error={errorText(wizard.errors.locationLabel)}
              maxLength={80}
              testID="location-input"
            />
            <InputField
              label={t('spot.notes_label')}
              value={wizard.form.notes}
              onChangeText={(value) => wizard.updateField('notes', value)}
              placeholder={t('spot.notes_placeholder')}
              autoCapitalize="sentences"
              multiline
              error={errorText(wizard.errors.notes)}
              maxLength={500}
              testID="notes-input"
            />
            <InputField
              label={t('spot.plate_label')}
              value={wizard.form.plate}
              onChangeText={(value) => wizard.updateField('plate', value)}
              placeholder={t('spot.plate_placeholder')}
              autoCapitalize="characters"
              hint={t('spot.plate_hint')}
              error={errorText(wizard.errors.plate)}
              maxLength={20}
              testID="plate-input"
            />
            <StyledButton
              label={t('spot.save')}
              icon="checkmark-circle-outline"
              onPress={() => void onSave()}
              isLoading={wizard.isBusy}
              testID="save-spot-button"
            />
            <StyledButton label={t('common.back')} variant="ghost" onPress={wizard.goBack} testID="back-button" />
          </Stack>
        )}
      </Stack>
    </Screen>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  preview: { width: '100%', borderRadius: radii.md, backgroundColor: colors.photoBackdrop },
}));
