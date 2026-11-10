import { useCallback, useEffect } from 'react';
import { vibrate } from '../services/hapticsService';
import { useSettingsStore } from '../state/useSettingsStore';
import type { HapticPattern } from '../types/Settings';

export interface UseHaptics {
  play: (pattern: HapticPattern) => void;
}

/**
 * Plays a haptic pattern unless the user switched haptics
 * off in Me (SPEC P0-15). The setting is read when the pattern plays, so a timer that fires after
 * the switch was flipped still respects it.
 */
export function useHaptics(): UseHaptics {
  const isLoaded = useSettingsStore((state) => state.isLoaded);
  const load = useSettingsStore((state) => state.load);

  useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  const play = useCallback((pattern: HapticPattern) => {
    if (useSettingsStore.getState().haptics) vibrate(pattern);
  }, []);
  return { play };
}
