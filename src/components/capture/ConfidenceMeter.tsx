import { useTranslation } from 'react-i18next';
import type { ConfidenceTier } from '../../types/Identification';
import { confidenceTier } from '../../utils/identification';
import { Row } from '../primitives/Row';
import { Text } from '../primitives/Text';
import { ShiftLights } from '../progress/ShiftLights';

export interface ConfidenceMeterProps {
  /** 0..1 */
  confidence: number;
  testID?: string;
}

const TIER_TONE: Record<ConfidenceTier, 'success' | 'warning' | 'danger'> = {
  sure: 'success',
  likely: 'warning',
  guess: 'danger',
};

/**
 * Co-Driver's confidence as 5 shift lights plus a text tier (Sure ≥ 85 %, Likely 60–85 %, Guess
 * < 60 %) and the percentage: never shown by colour alone (SPEC P0-05).
 */
export function ConfidenceMeter({ confidence, testID = 'confidence-meter' }: ConfidenceMeterProps) {
  const { t } = useTranslation();
  const tier = confidenceTier(confidence);
  const percent = Math.round(Math.min(1, Math.max(0, confidence)) * 100);
  const tierLabel = t(`co_driver.tier_${tier}`);
  return (
    <Row gap="sm" align="center" testID={testID}>
      <ShiftLights ratio={confidence} leds={5} label={t('co_driver.confidence_label', { percent, tier: tierLabel })} />
      <Text variant="label" tone={TIER_TONE[tier]} testID={`${testID}-tier-${tier}`}>
        {tierLabel}
      </Text>
      <Text variant="numberSm" tone="muted">
        {t('co_driver.confidence_value', { percent })}
      </Text>
    </Row>
  );
}
