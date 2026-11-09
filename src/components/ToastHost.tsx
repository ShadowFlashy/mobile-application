import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore } from '../state/useToastStore';
import { Toast } from './primitives/Toast';

const VISIBLE_MS = 3500;
/** Keeps toasts above the bottom tab bar: its height plus some air, without the safe-area inset. */
const TAB_BAR_CLEARANCE = 88;

/**
 * Shows the global toast message and hides it automatically. The message is already translated
 * by whoever called show(), so this host renders it as is.
 */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const message = useToastStore((state) => state.message);
  const variant = useToastStore((state) => state.variant);
  const toastId = useToastStore((state) => state.toastId);
  const hide = useToastStore((state) => state.hide);

  useEffect(() => {
    if (message === undefined) return undefined;
    const timer = setTimeout(hide, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message, toastId, hide]);

  return (
    <Toast
      message={message ?? ''}
      variant={variant}
      visible={message !== undefined}
      // The tab bar grows by the bottom inset (gesture bar), so the toast moves up with it.
      bottomOffset={TAB_BAR_CLEARANCE + insets.bottom}
      testID="toast"
    />
  );
}
