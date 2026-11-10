import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CarModelPicker } from '../../../src/components/CarModelPicker';
import { VisibilityPicker } from '../../../src/components/garage/VisibilityPicker';
import { InputField } from '../../../src/components/primitives/InputField';
import { Screen } from '../../../src/components/primitives/Screen';
import { Section } from '../../../src/components/primitives/Section';
import { Stack } from '../../../src/components/primitives/Stack';
import { Text } from '../../../src/components/primitives/Text';
import { PrivacyNotice } from '../../../src/components/PrivacyNotice';
import { ScreenHeader } from '../../../src/components/ScreenHeader';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useCarModels } from '../../../src/hooks/useCarModels';
import { SHOUTOUT_MAX_LENGTH, useOwnerCarForm } from '../../../src/hooks/useOwnerCarForm';
import type { ValidationKey } from '../../../src/utils/validation';

/** "Add my car": model, plate, nickname and visibility. The car starts as Pending verification. */
export default function GarageNewScreen() {
  const { t } = useTranslation();
  const { data: models } = useCarModels();
  const form = useOwnerCarForm({
    onRegistered: () => {
      if (router.canGoBack()) router.back();
      else router.replace(routes.owners);
    },
  });

  const fieldError = (key?: ValidationKey) => (key === undefined ? undefined : t(`validation.${key}`));

  return (
    <Screen
      testID="garage-new-screen"
      footer={
        <StyledButton
          label={t('garage.register_submit')}
          icon="add-circle-outline"
          onPress={form.submit}
          isLoading={form.isPending}
          disabled={!form.canAdd}
          testID="register-car-button"
        />
      }
    >
      <Stack gap="lg">
        <ScreenHeader eyebrow={t('garage.eyebrow')} title={t('garage.add_car')} subtitle={t('garage.new_subtitle')} />

        {!form.canAdd && (
          <Text tone="warning" testID="garage-max-cars">
            {t('garage.max_cars')}
          </Text>
        )}

        <Section title={t('garage.model_section')}>
          <CarModelPicker
            models={models ?? []}
            selectedId={form.carModel?.id}
            onSelect={form.selectModel}
            isOtherSelected={form.isOtherModel}
            onChooseOther={form.chooseOther}
          />
          {form.carModel === undefined && !form.isOtherModel && form.errors.make !== undefined && (
            <Text tone="danger" testID="owner-model-error">
              {fieldError(form.errors.make)}
            </Text>
          )}
          {form.isOtherModel && (
            <Stack gap="md">
              <Text variant="bodySm" tone="muted">
                {t('garage.other_model_hint')}
              </Text>
              <InputField
                label={t('garage.make_label')}
                value={form.values.make}
                onChangeText={(value) => form.updateField('make', value)}
                placeholder={t('garage.make_placeholder')}
                autoCapitalize="words"
                error={fieldError(form.errors.make)}
                maxLength={40}
                testID="owner-make-input"
              />
              <InputField
                label={t('garage.model_label')}
                value={form.values.model}
                onChangeText={(value) => form.updateField('model', value)}
                placeholder={t('garage.model_placeholder')}
                autoCapitalize="words"
                error={fieldError(form.errors.model)}
                maxLength={60}
                testID="owner-model-input"
              />
            </Stack>
          )}
        </Section>

        <Section>
          <InputField
            label={t('garage.plate_label')}
            value={form.values.plate}
            onChangeText={(value) => form.updateField('plate', value)}
            placeholder={t('garage.plate_placeholder')}
            autoCapitalize="characters"
            autoComplete="off"
            error={fieldError(form.errors.plate)}
            maxLength={20}
            testID="owner-plate-input"
          />
          <InputField
            label={t('garage.nickname_label')}
            value={form.values.nickname}
            onChangeText={(value) => form.updateField('nickname', value)}
            placeholder={t('garage.nickname_placeholder')}
            autoCapitalize="words"
            error={fieldError(form.errors.nickname)}
            maxLength={40}
            testID="owner-nickname-input"
          />
        </Section>

        <Section title={t('garage.visibility_title')}>
          <VisibilityPicker value={form.visibility} onChange={form.setVisibility} isPending />
          {form.visibility !== 'hidden' && (
            <InputField
              label={t('garage.shoutout_label')}
              value={form.shoutout}
              onChangeText={form.setShoutout}
              placeholder={t('garage.shoutout_placeholder')}
              error={form.shoutoutError}
              maxLength={SHOUTOUT_MAX_LENGTH}
              testID="owner-shoutout-input"
            />
          )}
        </Section>

        <PrivacyNotice title={t('garage.plate_privacy_title')}>{t('garage.plate_privacy_body')}</PrivacyNotice>
      </Stack>
    </Screen>
  );
}
