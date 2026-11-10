import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { detectDeviceLanguage, isSupportedLanguage, type Language } from '../i18n';
import { getLanguagePreference, setLanguagePreference } from '../services/settingsService';
import { whenIdle } from '../utils/whenIdle';

/**
 * Applies the user's language on start: their choice from the profile, otherwise the device
 * language. The pre-rendered web page is English, so the switch waits until React has finished
 * hydrating it (the main thread is idle, see whenIdle); switching earlier makes expo-router's
 * Suspense boundaries hydrate with Dutch text and React throws their HTML away (#418 / #425 / #422).
 */
export function useLanguageSetup(): void {
  const { i18n } = useTranslation();
  useEffect(() => {
    let cancelled = false;
    let cancelIdle: (() => void) | undefined;
    void getLanguagePreference().then((preference) => {
      const language = preference ?? detectDeviceLanguage();
      if (cancelled || i18n.language === language) return;
      cancelIdle = whenIdle(() => {
        void i18n.changeLanguage(language);
      });
    });
    return () => {
      cancelled = true;
      cancelIdle?.();
    };
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
