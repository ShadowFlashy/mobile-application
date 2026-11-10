import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FormError } from '../../../src/components/brand/FormError';
import { CarModelPicker } from '../../../src/components/CarModelPicker';
import { NoteRow } from '../../../src/components/garage/NoteRow';
import { VisibilityPicker } from '../../../src/components/garage/VisibilityPicker';
import { InputField } from '../../../src/components/primitives/InputField';
import { Screen } from '../../../src/components/primitives/Screen';
import { Section } from '../../../src/components/primitives/Section';
import { Stack } from '../../../src/components/primitives/Stack';
import { PrivacyNotice } from '../../../src/components/PrivacyNotice';
import { StyledButton } from '../../../src/components/StyledButton';
import { routes } from '../../../src/constants/routes';
import { useCarModels } from '../../../src/hooks/useCarModels';
import { SHOUTOUT_MAX_LENGTH, useOwnerCarForm } from '../../../src/hooks/useOwnerCarForm';
import type { ValidationKey } from '../../../src/utils/validation';

/** "Add a car": model, plate, nickname and visibility. The car starts as Waiting for verification. */
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
      title={t('garage.add_car')}
      testID="garage-new-screen"
      footer={
        <StyledButton
          label={t('garage.register_submit')}
          onPress={form.submit}
          isLoading={form.isPending}
          disabled={!form.canAdd}
          testID="register-car-button"
        />
      }
    >
      <Stack gap="lg">
        {!form.canAdd && <FormError message={t('garage.max_cars')} testID="garage-max-cars" />}

        <Section title={t('garage.car_section')}>
          <Stack gap="md">
            <CarModelPicker
              label={t('garage.model_label')}
              models={models ?? []}
              selectedId={form.carModel?.id}
              onSelect={form.selectModel}
              isOtherSelected={form.isOtherModel}
              onChooseOther={form.chooseOther}
            />
            {form.carModel === undefined && !form.isOtherModel && (
              <FormError message={fieldError(form.errors.make)} testID="owner-model-error" />
            )}
            {form.isOtherModel && (
              <Stack gap="md">
                <NoteRow text={t('garage.other_model_hint')} divider={false} />
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
          </Stack>
        </Section>

        <Section title={t('garage.visibility_title')}>
          <Stack gap="md">
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
          </Stack>
        </Section>

        <PrivacyNotice title={t('garage.plate_privacy_title')}>{t('garage.plate_privacy_body')}</PrivacyNotice>
      </Stack>
    </Screen>
  );
}
