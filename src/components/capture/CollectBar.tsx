import { useTranslation } from 'react-i18next';
import type { PlateGate } from '../../types/Capture';
import { Icon } from '../primitives/Icon';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { StyledButton } from '../StyledButton';

export interface CollectBarProps {
  gate: PlateGate;
  onCollect: () => void;
  isSaving?: boolean;
  /** The last save failure, shown directly above COLLECT (the draft is kept for a retry). */
  saveError?: string;
  testID?: string;
}

/**
 * The sticky COLLECT bar (SPEC P0-03). While the gate is closed it says why in words ("Check the
 * plates first", "Pick the car first", "Needs a connection to save"), so a disabled button is
 * never a mystery.
 */
export function CollectBar({ gate, onCollect, isSaving = false, saveError, testID = 'collect-bar' }: CollectBarProps) {
  const { t } = useTranslation();
  const reason = gate.ok ? undefined : gate.reason;
  return (
    <Stack gap="sm" testID={testID}>
      {saveError !== undefined && (
        <Row gap="xs" align="flex-start" testID="collect-error">
          <Icon name="alert-circle" tone="danger" size={18} />
          <Stack gap="xxs" flex={1}>
            <Text variant="bodyStrong" tone="danger">
              {t('capture.save_error_title')}
            </Text>
            <Text variant="bodySm" tone="danger">
              {saveError}
            </Text>
          </Stack>
        </Row>
      )}
      {reason !== undefined && reason !== 'busy' && (
        <Text variant="caption" tone="muted" align="center" testID="collect-reason">
          {t(`capture.reason_${reason}`)}
        </Text>
      )}
      <StyledButton
        label={t('capture.collect')}
        variant="ignition"
        icon="albums"
        onPress={onCollect}
        disabled={!gate.ok}
        isLoading={isSaving}
        accessibilityHint={reason !== undefined ? t(`capture.reason_${reason}`) : t('capture.collect_hint')}
        testID="collect-button"
      />
    </Stack>
  );
}
