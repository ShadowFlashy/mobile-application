import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { registerServiceWorker } from '../services/pwaService';
import { useToastStore } from '../state/useToastStore';

/**
 * Registers the service worker of the installed PWA (SPEC §13.1, P0-19). When a new version is
 * waiting, the toast "Update available · Reload" appears; only that tap activates it (no
 * unconditional skipWaiting), and the page reloads once the new worker is in control.
 */
export function useServiceWorker(): void {
  const { t } = useTranslation();
  const show = useToastStore((state) => state.show);
  // The latest translations without re-registering the worker when the language changes.
  const translate = useRef(t);
  translate.current = t;

  useEffect(
    () =>
      registerServiceWorker((apply) => {
        show(translate.current('pwa.update_available'), 'default', {
          label: translate.current('pwa.reload'),
          onPress: apply,
        });
      }),
    [show],
  );
}
