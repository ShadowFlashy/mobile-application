import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { detectDeviceLanguage, isSupportedLanguage, type Language } from '../i18n';
import { getLanguagePreference, setLanguagePreference } from '../services/settingsService';

/**
 * Applies the user's language on start: their choice from the profile, otherwise the device
 * language. Runs after the first render so the pre-rendered web page hydrates without mismatch.
 */
export function useLanguageSetup(): void {
  const { i18n } = useTranslation();
  useEffect(() => {
    void getLanguagePreference().then((preference) => {
      const language = preference ?? detectDeviceLanguage();
      if (i18n.language !== language) void i18n.changeLanguage(language);
    });
  }, [i18n]);
}

/** Current language plus a function to switch and remember it (course ch. 3: personalisation). */
export function useLanguage(): { language: Language; changeLanguage: (language: Language) => void } {
  const { i18n } = useTranslation();
  const language: Language = isSupportedLanguage(i18n.language) ? i18n.language : 'en';
  const changeLanguage = useCallback(
    (next: Language) => {
      void i18n.changeLanguage(next);
      void setLanguagePreference(next);
    },
    [i18n],
  );
  return { language, changeLanguage };
}
