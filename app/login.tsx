import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { BrandHeader } from '../src/components/BrandHeader';
import { InputField } from '../src/components/primitives/InputField';
import { Screen } from '../src/components/primitives/Screen';
import { Stack } from '../src/components/primitives/Stack';
import { Text } from '../src/components/primitives/Text';
import { StyledButton } from '../src/components/StyledButton';
import { routes } from '../src/constants/routes';
import { getErrorMessage } from '../src/services/serviceError';
import { useAuthStore } from '../src/state/useAuthStore';
import { useTheme } from '../src/theme';
import {
  hasErrors,
  PASSWORD_MIN_LENGTH,
  validateLogin,
  type FormErrors,
  type ValidationKey,
} from '../src/utils/validation';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors<'email' | 'password'>>({});
  const [formError, setFormError] = useState<string>();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Also the navigation after a successful login: the store becomes authenticated and this redirects.
  if (isAuthenticated) return <Redirect href={routes.home} />;

  /** Validation returns message keys; the screen translates them. */
  const fieldError = (key?: ValidationKey): string | undefined =>
    key === undefined ? undefined : t(`validation.${key}`, { min: PASSWORD_MIN_LENGTH });

  const handleLogin = async () => {
    setFormError(undefined);
    const validation = validateLogin(email, password);
    setErrors(validation);
    if (hasErrors(validation)) return;
    try {
      await login(email, password);
    } catch (error) {
      setFormError(getErrorMessage(error, 'login_failed'));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen padding="lg" testID="login-screen">
        <Stack gap="lg" justify="center" flex={1}>
          <BrandHeader subtitle={t('auth.tagline')} />
          <Text size="xl" weight="bold" heading>
            {t('auth.login_title')}
          </Text>
          <InputField
            label={t('auth.email_label')}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrors((current) => ({ ...current, email: undefined }));
            }}
            placeholder={t('auth.email_placeholder')}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            error={fieldError(errors.email)}
            testID="email-input"
          />
          <InputField
            label={t('auth.password_label')}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setErrors((current) => ({ ...current, password: undefined }));
            }}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            error={fieldError(errors.password)}
            onSubmitEditing={() => void handleLogin()}
            testID="password-input"
          />
          {formError !== undefined && (
            <Text color={colors.danger} testID="login-error">
              {formError}
            </Text>
          )}
          <StyledButton
            label={t('auth.login_button')}
            onPress={() => void handleLogin()}
            isLoading={isLoading}
            testID="login-button"
          />
          <StyledButton
            label={t('auth.go_to_register')}
            variant="ghost"
            onPress={() => router.push(routes.register)}
            testID="go-to-register"
          />
          <Text size="sm" align="center" color={colors.textMuted} testID="demo-hint">
            {t('auth.demo_hint')}
          </Text>
        </Stack>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
