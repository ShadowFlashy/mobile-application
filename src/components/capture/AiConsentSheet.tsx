import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '../primitives/Icon';
import { Row } from '../primitives/Row';
import { Sheet } from '../primitives/Sheet';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { StyledButton } from '../StyledButton';

export interface AiConsentSheetProps {
  visible: boolean;
  onAccept: () => void;
  /** "Fill in myself": switches Co-Driver off; closing the sheet counts as this too. */
  onDecline: () => void;
  testID?: string;
}

const POINTS: { key: 'consent_point_blur' | 'consent_point_limit' | 'consent_point_switch'; icon: IconName }[] = [
  { key: 'consent_point_blur', icon: 'eye-off-outline' },
  { key: 'consent_point_limit', icon: 'speedometer-outline' },
  { key: 'consent_point_switch', icon: 'shield-checkmark-outline' },
];

/** First-use consent for Co-Driver (SPEC P0-18, §6.1 d): what is sent where, and the way out. */
export function AiConsentSheet({ visible, onAccept, onDecline, testID = 'ai-consent-sheet' }: AiConsentSheetProps) {
  const { t } = useTranslation();
  return (
    <Sheet visible={visible} onClose={onDecline} title={t('co_driver.consent_title')} testID={testID}>
      <Stack gap="md">
        <Text>{t('co_driver.consent_body')}</Text>
        <Stack gap="sm">
          {POINTS.map((point) => (
            <Row key={point.key} gap="sm" align="center">
              <Icon name={point.icon} tone="accent" size={20} />
              <Stack flex={1}>
                <Text variant="bodySm">{t(`co_driver.${point.key}`)}</Text>
              </Stack>
            </Row>
          ))}
        </Stack>
        <StyledButton
          label={t('co_driver.consent_accept')}
          icon="sparkles"
          onPress={onAccept}
          testID="consent-accept"
        />
        <StyledButton
          label={t('co_driver.consent_decline')}
          variant="secondary"
          onPress={onDecline}
          testID="consent-decline"
        />
      </Stack>
    </Sheet>
  );
}
