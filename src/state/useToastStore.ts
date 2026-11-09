import { create } from 'zustand';

export type ToastVariant = 'default' | 'success' | 'error';

interface ToastState {
  message?: string;
  variant: ToastVariant;
  /** Changes on every toast so the same message can be shown twice in a row. */
  toastId: number;
  show: (message: string, variant?: ToastVariant) => void;
  hide: () => void;
}

/** Global feedback messages (course ch. 3: give feedback on every action). */
export const useToastStore = create<ToastState>((set, get) => ({
  message: undefined,
  variant: 'default',
  toastId: 0,
  show: (message, variant = 'default') => set({ message, variant, toastId: get().toastId + 1 }),
  hide: () => set({ message: undefined }),
}));
