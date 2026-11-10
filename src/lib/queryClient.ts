import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { DAY, MINUTE } from '../constants/time';

/**
 * Server state lives in TanStack Query, client state in Zustand (course ch. 6.7).
 * The cache is persisted to AsyncStorage, so the sticker book still shows when the phone is
 * offline (course ch. 22: read-only offline).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: MINUTE,
      gcTime: DAY,
      retry: 1,
    },
  },
});

// `window` exists in browsers and in React Native, but not while the web build is pre-rendered in Node.
const hasStorage = typeof window !== 'undefined';

export const queryPersister = createAsyncStoragePersister({
  storage: hasStorage ? AsyncStorage : undefined,
  key: 'redline-query-cache',
});

export const PERSIST_MAX_AGE = DAY;
/** Bump when cached data shapes change, so old caches are thrown away (course ch. 6: robust rehydration). */
export const CACHE_BUSTER = 'redline-v2';
