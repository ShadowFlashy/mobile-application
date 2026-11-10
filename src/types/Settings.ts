export const HAPTIC_PATTERNS = ['tap', 'tear', 'stamp', 'shiftUp', 'stick', 'error'] as const;
export type HapticPattern = (typeof HAPTIC_PATTERNS)[number];
export interface AppSettings {
  aiEnabled: boolean;
  autoLocation: boolean;
  haptics: boolean;
  shareNameDefault: boolean;
  aiConsentVersion: number;
  seenAchievements: string[];
}
