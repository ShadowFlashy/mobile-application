import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';
import en from './locales/en.json';
import nl from './locales/nl.json';

/**
 * Internationalisation (course ch. 20): no user-facing text is hardcoded in JSX, every string
 * goes through t('key'). English is the complete default language; Dutch is the second one.
 */
export const SUPPORTED_LANGUAGES = ['en', 'nl'] as const; // const assertion: keeps the literal union
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export function isSupportedLanguage(code: string): code is Language {
  return SUPPORTED_LANGUAGES.some((language) => language === code);
}

/** Language of the device, falling back to English. */
export function detectDeviceLanguage(): Language {
  try {
    const code = getLocales()[0]?.languageCode ?? 'en';
    return isSupportedLanguage(code) ? code : 'en';
  } catch {
    return 'en';
  }
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, nl: { translation: nl } },
  // The web build is pre-rendered (static export) in English; the device language is applied
  // right after hydration (see useLanguageSetup) so the HTML and the first render match.
  lng: Platform.OS === 'web' ? 'en' : detectDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes rendered text
  returnNull: false,
});

export default i18n;
