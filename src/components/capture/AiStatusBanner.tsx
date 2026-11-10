import { useTranslation } from 'react-i18next';
import type { UnavailableReason } from '../../types/Identification';
import type { IconName } from '../primitives/Icon';
import { StatusRow } from './StatusRow';

export interface AiStatusBannerProps {
  reason: UnavailableReason;
  testID?: string;
}

const ICONS: Record<UnavailableReason, IconName> = {
  offline: 'offline',
  disabled: 'power',
  timeout: 'clock',
  quota: 'battery',
  busy: 'pause',
  not_configured: 'tools',
  error: 'warning',
  unsupported: 'phone',
};

/**
 * Why auto-fill did not fill anything in (SPEC P0-06), as a plain status row. The review simply
 * stays in manual mode with the same "Add to album" path: a specific reason, never a dead end.
 */
export function AiStatusBanner({ reason, testID = 'ai-status-banner' }: AiStatusBannerProps) {
  const { t } = useTranslation();
  return (
    <StatusRow
      icon={ICONS[reason]}
      title={t(`co_driver.banner_${reason}_title`)}
      body={t(`co_driver.banner_${reason}_body`)}
      titleTestID={`${testID}-${reason}`}
      testID={testID}
    />
  );
}
