import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupportedStorage } from '@supabase/supabase-js';

/**
 * Where the Supabase session is persisted — web / PWA version.
 *
 * Browsers have no OS keychain, so the session is kept through AsyncStorage (backed by the
 * origin-scoped storage of the HTTPS-only PWA). The Android app uses the Keystore instead,
 * see authStorage.native.ts, as the course prescribes for tokens on a device.
 *
 * During the static export (pre-rendering in Node) there is no browser storage at all, so the
 * adapter then behaves as an empty store.
 */
const isBrowser = typeof window !== 'undefined';

export const authStorage: SupportedStorage = {
  getItem: (key) => (isBrowser ? AsyncStorage.getItem(key) : Promise.resolve(null)),
  setItem: (key, value) => (isBrowser ? AsyncStorage.setItem(key, value) : Promise.resolve()),
  removeItem: (key) => (isBrowser ? AsyncStorage.removeItem(key) : Promise.resolve()),
};
