import { useTranslation } from 'react-i18next';
import { Row } from '../primitives/Row';
import { Spinner } from '../primitives/Spinner';
import { Surface } from '../primitives/Surface';
import { Tag } from '../primitives/Tag';
import { Text } from '../primitives/Text';

export interface AnalysingChipProps {
  /** Ignores any later Co-Driver answer for this photo. */
  onFillManually: () => void;
  testID?: string;
}

/**
 * The quiet, non-blocking "Co-Driver is analysing…" status (D-15), with **Fill in myself** always
 * visible next to it (SPEC P0-06).
 */
export function AnalysingChip({ onFillManually, testID = 'analysing-chip' }: AnalysingChipProps) {
  const { t } = useTranslation();
  return (
    <Surface variant="inverse" radius="lg" padding="sm" testID={testID}>
      <Row gap="sm" align="center" justify="space-between" wrap>
        <Row gap="sm" align="center">
          <Spinner size="small" tone="inverse" />
          <Text variant="bodyStrong" tone="inverse" accessibilityLabel={t('co_driver.analysing')}>
            {t('co_driver.analysing')}
          </Text>
        </Row>
        <Tag
          label={t('co_driver.fill_myself')}
          icon="create-outline"
          onPress={onFillManually}
          testID="fill-myself-button"
        />
      </Row>
    </Surface>
  );
}
