import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Row } from '../primitives/Row';
import { Tag } from '../primitives/Tag';

export interface AiStatusChipsProps {
  aiEnabled: boolean;
  autoLocation: boolean;
  /** Co-Driver scans left today, when known. */
  remaining?: number;
  isOnline: boolean;
  testID?: string;
}

/** The Spot launcher's status line: Co-Driver on/off, auto-city on/off, scans left, offline. */
export function AiStatusChips({
  aiEnabled,
  autoLocation,
  remaining,
  isOnline,
  testID = 'ai-status-chips',
}: AiStatusChipsProps) {
  const { t } = useTranslation();
  return (
    <View accessibilityRole="summary" accessibilityLabel={t('spot.status_label')}>
      <Row gap="xs" wrap justify="center" testID={testID}>
        <Tag
          label={aiEnabled ? t('spot.chip_ai_on') : t('spot.chip_ai_off')}
          icon={aiEnabled ? 'sparkles' : 'power-outline'}
          tone={aiEnabled ? 'accent' : 'default'}
          testID={aiEnabled ? 'chip-ai-on' : 'chip-ai-off'}
        />
        <Tag
          label={autoLocation ? t('spot.chip_city_on') : t('spot.chip_city_off')}
          icon={autoLocation ? 'locate' : 'location-outline'}
          testID={autoLocation ? 'chip-city-on' : 'chip-city-off'}
        />
        {aiEnabled && remaining !== undefined && (
          <Tag label={t('spot.chip_scans', { count: remaining })} icon="speedometer-outline" testID="chip-scans" />
        )}
        {!isOnline && <Tag label={t('spot.chip_offline')} icon="cloud-offline-outline" testID="chip-offline" />}
      </Row>
    </View>
  );
}
