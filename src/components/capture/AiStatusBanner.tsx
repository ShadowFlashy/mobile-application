import { useTranslation } from 'react-i18next';
import type { UnavailableReason } from '../../types/Identification';
import { Icon, type IconName } from '../primitives/Icon';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Text } from '../primitives/Text';

export interface AiStatusBannerProps {
  reason: UnavailableReason;
  testID?: string;
}

const ICONS: Record<UnavailableReason, IconName> = {
  offline: 'cloud-offline-outline',
  disabled: 'power-outline',
  timeout: 'timer-outline',
  quota: 'speedometer-outline',
  busy: 'hourglass-outline',
  not_configured: 'construct-outline',
  error: 'warning-outline',
  unsupported: 'phone-portrait-outline',
};

/**
 * Why Co-Driver did not fill anything in (SPEC P0-06). The review simply stays in manual mode with
 * the same COLLECT path: a specific reason, never a dead end.
 */
export function AiStatusBanner({ reason, testID = 'ai-status-banner' }: AiStatusBannerProps) {
  const { t } = useTranslation();
  return (
    <Surface variant="sunken" padding="smd" testID={testID}>
      <Row gap="smd" align="flex-start">
        <Icon name={ICONS[reason]} tone="muted" />
        <Stack gap="xxs" flex={1}>
          <Text variant="bodyStrong" testID={`${testID}-${reason}`}>
            {t(`co_driver.banner_${reason}_title`)}
          </Text>
          <Text variant="bodySm" tone="muted">
            {t(`co_driver.banner_${reason}_body`)}
          </Text>
        </Stack>
      </Row>
    </Surface>
  );
}
