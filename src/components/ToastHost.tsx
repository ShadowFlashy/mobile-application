import { useContext, useEffect } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useToastStore } from '../state/useToastStore';
import { Toast } from './primitives/Toast';

const VISIBLE_MS = 3500;
/** Toasts with an action ("Update available · Reload") stay longer, so they can be tapped. */
const ACTION_VISIBLE_MS = 10000;
/** Keeps toasts above the bottom tab bar and its raised Ignition button, without the safe-area inset. */
const TAB_BAR_CLEARANCE = 104;

/**
 * Shows the global toast message and hides it automatically. The message is already translated
 * by whoever called show(), so this host renders it as is.
 */
export function ToastHost() {
  const insets = useContext(SafeAreaInsetsContext);
  const message = useToastStore((state) => state.message);
  const variant = useToastStore((state) => state.variant);
  const action = useToastStore((state) => state.action);
  const toastId = useToastStore((state) => state.toastId);
  const hide = useToastStore((state) => state.hide);

  useEffect(() => {
    if (message === undefined) return undefined;
    const timer = setTimeout(hide, action !== undefined ? ACTION_VISIBLE_MS : VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message, toastId, hide, action]);

  return (
    <Toast
      message={message ?? ''}
      variant={variant}
      visible={message !== undefined}
      action={
        action !== undefined
          ? {
              label: action.label,
              onPress: () => {
                action.onPress();
                hide();
              },
            }
          : undefined
      }
      // The tab bar grows by the bottom inset (gesture bar), so the toast moves up with it.
      bottomOffset={TAB_BAR_CLEARANCE + (insets?.bottom ?? 0)}
      testID="toast"
    />
  );
}
