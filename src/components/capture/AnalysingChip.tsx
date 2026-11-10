import { useTranslation } from 'react-i18next';
import { StyledButton } from '../StyledButton';
import { StatusRow } from './StatusRow';

export interface AnalysingChipProps {
  /** Ignores any later auto-fill answer for this photo. */
  onFillManually: () => void;
  testID?: string;
}

/**
 * The quiet, non-blocking "Auto-fill is analysing…" status row (D-15), with **Fill in myself**
 * always next to it (SPEC P0-06).
 */
export function AnalysingChip({ onFillManually, testID = 'analysing-chip' }: AnalysingChipProps) {
  const { t } = useTranslation();
  return (
    <StatusRow
      busy
      title={t('co_driver.analysing')}
      actions={
        <StyledButton
          label={t('co_driver.fill_myself')}
          variant="text"
          onPress={onFillManually}
          testID="fill-myself-button"
        />
      }
      testID={testID}
    />
  );
}
