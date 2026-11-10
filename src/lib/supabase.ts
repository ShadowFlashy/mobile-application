import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import type { Database } from '../types/database';
import { authStorage } from './authStorage';

/**
 * The single Supabase client of the app (lecturer's "Supabase in our codebase" setup).
 * Keys come from environment variables (.env, never committed) and are inlined by Expo at build
 * time. The publishable/anon key is public by design: row level security protects every table.
 * Only files in src/services may use this client (no API calls in components).
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (supabaseUrl.length === 0 || supabaseAnonKey.length === 0) {
  throw new Error(
    'Supabase is not configured: copy .env.example to .env and fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

/**
 * Key under which the session is persisted (Supabase's own default, made explicit so the offline
 * session fallback in authService can read the stored session JSON): `sb-<project-ref>-auth-token`.
 */
export const AUTH_STORAGE_KEY = `sb-${new URL(supabaseUrl).hostname.split('.')[0] ?? 'redline'}-auth-token`;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    storageKey: AUTH_STORAGE_KEY,
    autoRefreshToken: true,
    persistSession: true,
    // Email confirmation links open the web app with the session in the URL.
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Native apps only refresh tokens while in the foreground (Supabase guide for React Native).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}
