import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../src/components/brand/AuthLayout';
import { FormError } from '../src/components/brand/FormError';
import { BrandHeader } from '../src/components/BrandHeader';
import { EmptyState } from '../src/components/primitives/EmptyState';
import { InputField } from '../src/components/primitives/InputField';
import { Screen } from '../src/components/primitives/Screen';
import { Text } from '../src/components/primitives/Text';
import { StyledButton } from '../src/components/StyledButton';
import { routes } from '../src/constants/routes';
import { getErrorMessage } from '../src/services/serviceError';
import { useAuthStore } from '../src/state/useAuthStore';
import {
  hasErrors,
  PASSWORD_MIN_LENGTH,
  validateRegister,
  type FormErrors,
  type RegisterInput,
  type ValidationKey,
} from '../src/utils/validation';

const EMPTY_FORM: RegisterInput = { username: '', email: '', password: '', confirmPassword: '' };

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState<RegisterInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors<keyof RegisterInput>>({});
  const [formError, setFormError] = useState<string>();
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Also the navigation after signing up without email confirmation: the store is authenticated then.
  if (isAuthenticated) return <Redirect href={routes.home} />;

  /** Validation returns message keys; the screen translates them. */
  const fieldError = (key?: ValidationKey): string | undefined =>
    key === undefined ? undefined : t(`validation.${key}`, { min: PASSWORD_MIN_LENGTH });

  const updateField = (field: keyof RegisterInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleRegister = async () => {
    setFormError(undefined);
    const validation = validateRegister(form);
    setErrors(validation);
    if (hasErrors(validation)) return;
    try {
      const result = await register({ username: form.username, email: form.email, password: form.password });
      if (result.needsEmailConfirmation) setIsWaitingForConfirmation(true);
    } catch (error) {
      setFormError(getErrorMessage(error, 'register_failed'));
    }
  };

  if (isWaitingForConfirmation) {
    return (
      <Screen>
        <EmptyState
          icon="mail"
          title={t('auth.confirm_title')}
          description={t('auth.confirm_description', { email: form.email.trim() })}
          action={<StyledButton label={t('auth.back_to_login')} onPress={() => router.replace(routes.login)} />}
          testID="confirm-email-message"
        />
      </Screen>
    );
  }

  return (
    <AuthLayout
      testID="register-screen"
      footer={
        <>
          <StyledButton
            label={t('auth.go_to_login')}
            variant="text"
            onPress={() => router.replace(routes.login)}
            testID="go-to-login"
          />
          <StyledButton
            label={t('auth.privacy_link')}
            variant="text"
            onPress={() => router.push(routes.privacy)}
            testID="go-to-privacy"
          />
        </>
      }
    >
      <BrandHeader subtitle={t('auth.register_tagline')} size="md" />
      <Text variant="title" heading>
        {t('auth.register_title')}
      </Text>
      <InputField
        label={t('auth.username_label')}
        value={form.username}
        onChangeText={(value) => updateField('username', value)}
        placeholder={t('auth.username_placeholder')}
        autoComplete="username"
        textContentType="username"
        hint={t('auth.username_hint')}
        error={fieldError(errors.username)}
        maxLength={24}
        testID="username-input"
      />
      <InputField
        label={t('auth.email_label')}
        value={form.email}
        onChangeText={(value) => updateField('email', value)}
        placeholder={t('auth.email_placeholder')}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        error={fieldError(errors.email)}
        testID="register-email-input"
      />
      <InputField
        label={t('auth.password_label')}
        value={form.password}
        onChangeText={(value) => updateField('password', value)}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        hint={t('auth.password_hint', { min: PASSWORD_MIN_LENGTH })}
        error={fieldError(errors.password)}
        testID="register-password-input"
      />
      <InputField
        label={t('auth.confirm_password_label')}
        value={form.confirmPassword}
        onChangeText={(value) => updateField('confirmPassword', value)}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        error={fieldError(errors.confirmPassword)}
        onSubmitEditing={() => void handleRegister()}
        testID="register-confirm-input"
      />
      <FormError message={formError} testID="register-error" />
      <StyledButton
        label={t('auth.register_button')}
        onPress={() => void handleRegister()}
        isLoading={isLoading}
        testID="register-button"
      />
    </AuthLayout>
  );
}
