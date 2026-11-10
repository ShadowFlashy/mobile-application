import { create } from 'zustand';
import { queryClient, queryPersister } from '../lib/queryClient';
import {
  login as loginService,
  logout as logoutService,
  onAuthChange,
  register as registerService,
  restoreSession,
  type RegisterInput,
  type RegisterResult,
} from '../services/authService';
import { clearUserCaches, onBackOnline } from '../services/pwaService';
import type { User } from '../types/User';

interface AuthState {
  user?: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** False until the persisted session has been restored on app start. */
  isInitialized: boolean;
  /**
   * True while the app runs on the session stored on this device because it could not be refreshed
   * offline (SPEC §13.3): cached data is shown read-only until the network is back.
   */
  isOfflineSession: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  /** Clears the session state without calling the server, e.g. after the account was deleted. */
  markSignedOut: () => void;
}

let unsubscribeAuth: (() => void) | undefined;
let unsubscribeOnline: (() => void) | undefined;

/**
 * Removes everything the signed-in user left on this device: the in-memory and persisted query cache
 * and the service worker's photo cache. Runs on every sign-out, whatever caused it.
 */
export async function wipeUserDataOnDevice(): Promise<void> {
  queryClient.clear();
  clearUserCaches();
  try {
    await queryPersister.removeClient();
  } catch {
    // Storage unavailable (private mode): nothing was persisted then.
  }
}

const SIGNED_OUT = { user: undefined, isAuthenticated: false, isOfflineSession: false } as const;

export const useAuthStore = create<AuthState>((set, get) => {
  /** Checks the session again (network back, token refreshed): offline → online, or signed out. */
  const revalidate = async () => {
    if (!get().isOfflineSession) return;
    try {
      const { user, isOffline } = await restoreSession();
      if (isOffline) return;
      if (user === undefined) {
        set(SIGNED_OUT);
        await wipeUserDataOnDevice();
        return;
      }
      set({ user, isAuthenticated: true, isOfflineSession: false });
      void queryClient.invalidateQueries();
    } catch {
      // Still no usable connection: stay read-only and try again on the next event.
    }
  };

  return {
    user: undefined,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    isOfflineSession: false,

    initialize: async () => {
      if (get().isInitialized) return;
      try {
        const { user, isOffline } = await restoreSession();
        set({ user, isAuthenticated: user !== undefined, isOfflineSession: isOffline, isInitialized: true });
      } catch {
        set({ ...SIGNED_OUT, isInitialized: true });
      }

      unsubscribeAuth?.();
      unsubscribeAuth = onAuthChange((event) => {
        if (event === 'signed-out') {
          set(SIGNED_OUT);
          void wipeUserDataOnDevice();
          return;
        }
        if (event === 'token-refreshed') {
          void revalidate();
          return;
        }
        // e.g. the user opened the email confirmation link
        if (!get().isAuthenticated) {
          void restoreSession().then(({ user, isOffline }) =>
            set({ user, isAuthenticated: user !== undefined, isOfflineSession: isOffline }),
          );
        }
      });
      unsubscribeOnline?.();
      unsubscribeOnline = onBackOnline(() => void revalidate());
    },

    login: async (email, password) => {
      set({ isLoading: true });
      try {
        const user = await loginService(email, password);
        set({ user, isAuthenticated: true, isOfflineSession: false, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    register: async (input) => {
      set({ isLoading: true });
      try {
        const result = await registerService(input);
        set({
          user: result.user,
          isAuthenticated: result.user !== undefined,
          isOfflineSession: false,
          isLoading: false,
        });
        return result;
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        await logoutService();
      } finally {
        set({ ...SIGNED_OUT, isLoading: false });
        await wipeUserDataOnDevice();
      }
    },

    markSignedOut: () => {
      set({ ...SIGNED_OUT, isLoading: false });
      void wipeUserDataOnDevice();
    },
  };
});
