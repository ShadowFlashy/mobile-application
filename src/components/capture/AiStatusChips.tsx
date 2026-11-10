import { useTranslation } from 'react-i18next';
import { Text } from '../primitives/Text';

export interface AiStatusChipsProps {
  aiEnabled: boolean;
  autoLocation: boolean;
  /** Auto-fills left today, when known. */
  remaining?: number;
  isOnline: boolean;
  testID?: string;
}

/**
 * The Spot tab's status as one plain meta line (never chips): "12 auto-fills left today", or
 * "Auto-fill off", plus "City from location off" and "Offline" only when they apply.
 */
export function AiStatusChips({
  aiEnabled,
  autoLocation,
  remaining,
  isOnline,
  testID = 'ai-status-line',
}: AiStatusChipsProps) {
  const { t } = useTranslation();
  const parts = [
    aiEnabled
      ? remaining !== undefined
        ? t('spot.autofills_left', { count: remaining })
        : t('spot.chip_ai_on')
      : t('spot.chip_ai_off'),
    autoLocation ? undefined : t('spot.chip_city_off'),
    isOnline ? undefined : t('spot.chip_offline'),
  ].filter((part): part is string => part !== undefined);
  return (
    <Text
      variant="meta"
      tone="text2"
      accessibilityLabel={`${t('spot.status_label')}: ${parts.join(', ')}`}
      testID={testID}
    >
      {parts.join(' · ')}
    </Text>
  );
}
