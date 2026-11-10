import { create } from 'zustand';
import { DEFAULT_SETTINGS, getSettings, saveSettings } from '../services/settingsService';
import type { AppSettings } from '../types/Settings';

interface SettingsState extends AppSettings {
  /** False until the stored settings were read from the device. */
  isLoaded: boolean;
  load: () => Promise<void>;
  update: (patch: Partial<AppSettings>) => void;
}

/** Device settings (client state), persisted through settingsService (key `redline-settings`). */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoaded: false,
  load: async () => {
    if (get().isLoaded) return;
    const stored = await getSettings();
    set({ ...stored, isLoaded: true });
  },
  update: (patch) => {
    set(patch);
    void saveSettings(patch);
  },
}));

/** The plain settings object of a store state (without the actions). */
export function selectSettings(state: SettingsState): AppSettings {
  return {
    aiEnabled: state.aiEnabled,
    autoLocation: state.autoLocation,
    haptics: state.haptics,
    shareNameDefault: state.shareNameDefault,
    aiConsentVersion: state.aiConsentVersion,
    seenAchievements: state.seenAchievements,
  };
}
