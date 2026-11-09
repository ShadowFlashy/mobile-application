import { create } from 'zustand';
import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  onAuthChange,
  register as registerService,
  type RegisterInput,
  type RegisterResult,
} from '../services/authService';
import type { User } from '../types/User';

interface AuthState {
  user?: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** False until the persisted session has been restored on app start. */
  isInitialized: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  /** Clears the session state without calling the server, e.g. after the account was deleted. */
  markSignedOut: () => void;
}

let unsubscribeAuth: (() => void) | undefined;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: undefined,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: user !== undefined, isInitialized: true });
    } catch {
      set({ user: undefined, isAuthenticated: false, isInitialized: true });
    }

    unsubscribeAuth?.();
    unsubscribeAuth = onAuthChange((event) => {
      if (event === 'signed-out') {
        set({ user: undefined, isAuthenticated: false });
        return;
      }
      // e.g. the user opened the email confirmation link
      if (!get().isAuthenticated) {
        void getCurrentUser().then((user) => set({ user, isAuthenticated: user !== undefined }));
      }
    });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const user = await loginService(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (input) => {
    set({ isLoading: true });
    try {
      const result = await registerService(input);
      set({ user: result.user, isAuthenticated: result.user !== undefined, isLoading: false });
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
      set({ user: undefined, isAuthenticated: false, isLoading: false });
    }
  },

  markSignedOut: () => set({ user: undefined, isAuthenticated: false, isLoading: false }),
}));
