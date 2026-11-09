import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupportedLanguage, type Language } from '../i18n';

const LANGUAGE_KEY = 'redline-language';

/** Language the user picked in the profile, if any (small, non-sensitive preference). */
export async function getLanguagePreference(): Promise<Language | undefined> {
  try {
    const value = await AsyncStorage.getItem(LANGUAGE_KEY);
    return value !== null && isSupportedLanguage(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export async function setLanguagePreference(language: Language): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}
