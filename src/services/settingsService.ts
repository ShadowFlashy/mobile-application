import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupportedLanguage, type Language } from '../i18n';
import type { AppSettings } from '../types/Settings';
import { isRecord, isStringArray } from '../utils/typeGuards';

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

const SETTINGS_KEY = 'redline-settings';

/** Defaults of every device setting (SPEC §10.3): Co-Driver and auto-city on, name sharing off. */
export const DEFAULT_SETTINGS: AppSettings = {
  aiEnabled: true,
  autoLocation: true,
  haptics: true,
  shareNameDefault: false,
  aiConsentVersion: 0,
  seenAchievements: [],
};

/** Keeps only known fields with the right type, so a corrupt or old stored value never breaks the app. */
function parseSettings(raw: unknown): AppSettings {
  if (!isRecord(raw)) return { ...DEFAULT_SETTINGS };
  const flag = (key: 'aiEnabled' | 'autoLocation' | 'haptics' | 'shareNameDefault'): boolean => {
    const value = raw[key];
    return typeof value === 'boolean' ? value : DEFAULT_SETTINGS[key];
  };
  const consent = raw.aiConsentVersion;
  const seen = raw.seenAchievements;
  return {
    aiEnabled: flag('aiEnabled'),
    autoLocation: flag('autoLocation'),
    haptics: flag('haptics'),
    shareNameDefault: flag('shareNameDefault'),
    aiConsentVersion: typeof consent === 'number' && Number.isFinite(consent) ? consent : 0,
    seenAchievements: isStringArray(seen) ? seen : [],
  };
}

/** Device settings (small, non-sensitive preferences; never plates, coordinates or AI answers). */
export async function getSettings(): Promise<AppSettings> {
  try {
    const value = await AsyncStorage.getItem(SETTINGS_KEY);
    if (value === null) return { ...DEFAULT_SETTINGS };
    const parsed: unknown = JSON.parse(value);
    return parseSettings(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Merges a change into the stored settings. Failing storage (private mode) is ignored on purpose. */
export async function saveSettings(patch: Partial<AppSettings>): Promise<void> {
  try {
    const current = await getSettings();
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...patch }));
  } catch {
    // The settings then only live in memory for this session.
  }
}
