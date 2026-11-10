import { create } from 'zustand';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

/** Optional button on a toast, e.g. "Update available · Reload". */
export interface ToastAction {
  label: string;
  onPress: () => void;
}

interface ToastState {
  message?: string;
  variant: ToastVariant;
  action?: ToastAction;
  /** Changes on every toast so the same message can be shown twice in a row. */
  toastId: number;
  show: (message: string, variant?: ToastVariant, action?: ToastAction) => void;
  hide: () => void;
}

/** Global feedback messages (course ch. 3: give feedback on every action). */
export const useToastStore = create<ToastState>((set, get) => ({
  message: undefined,
  variant: 'default',
  action: undefined,
  toastId: 0,
  show: (message, variant = 'default', action) => set({ message, variant, action, toastId: get().toastId + 1 }),
  hide: () => set({ message: undefined, action: undefined }),
}));
