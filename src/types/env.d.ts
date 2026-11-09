/// <reference types="expo/types" />

// Environment variables used by the app. Values live in .env (never committed, see .env.example).
// Expo inlines every EXPO_PUBLIC_* variable at build time.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_SUPABASE_URL?: string;
    readonly EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
  }
}
