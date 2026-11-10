import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '../src/components/primitives/Screen';
import { SegmentedControl } from '../src/components/primitives/SegmentedControl';
import { Stack } from '../src/components/primitives/Stack';
import { StyledButton } from '../src/components/StyledButton';
import { PrivacyDocument } from '../src/components/trust/PrivacyDocument';
import { routes } from '../src/constants/routes';
import { useLanguage } from '../src/hooks/useLanguage';
import { isSupportedLanguage, SUPPORTED_LANGUAGES, type Language } from '../src/i18n';

/**
 * The privacy policy (SPEC P0-18): public, so anyone can read it before creating an account, in
 * English and Dutch. Linked from login, register, Profile and the Trust Center.
 */
export default function PrivacyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language, changeLanguage } = useLanguage();
  const languageOptions = SUPPORTED_LANGUAGES.map((code) => ({ value: code, label: t(`profile.language_${code}`) }));

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(routes.home);
  };

  return (
    <Screen testID="privacy-screen">
      <Stack gap="lg">
        <PrivacyDocument
          toolbar={
            <SegmentedControl<Language>
              options={languageOptions}
              value={language}
              onChange={(next) => {
                if (isSupportedLanguage(next)) changeLanguage(next);
              }}
              accessibilityLabel={t('privacy.language_label')}
              testID="privacy-language"
            />
          }
          testID="privacy-document"
        />
        <StyledButton label={t('privacy.back')} variant="secondary" onPress={goBack} testID="privacy-back" />
      </Stack>
    </Screen>
  );
}
