import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectSettings, useSettingsStore } from '../state/useSettingsStore';
import type { AppSettings } from '../types/Settings';

export interface UseSettings {
  settings: AppSettings;
  update: (patch: Partial<AppSettings>) => void;
  isLoaded: boolean;
}

/** Device settings (Auto-fill, auto-city, haptics, name sharing, …). Loads them on first use. */
export function useSettings(): UseSettings {
  const settings = useSettingsStore(useShallow(selectSettings));
  const update = useSettingsStore((state) => state.update);
  const isLoaded = useSettingsStore((state) => state.isLoaded);
  const load = useSettingsStore((state) => state.load);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  return useMemo(() => ({ settings, update, isLoaded }), [settings, update, isLoaded]);
}
