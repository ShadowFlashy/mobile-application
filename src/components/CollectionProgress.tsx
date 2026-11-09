import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import { ProgressBar } from './primitives/ProgressBar';
import { Row } from './primitives/Row';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';

interface CollectionProgressProps {
  collected: number;
  total: number;
  /** Already translated name of what is counted, e.g. "All stickers" or a category. */
  label: string;
}

export function CollectionProgress({ collected, total, label }: CollectionProgressProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const ratio = total === 0 ? 0 : collected / total;
  const isComplete = total > 0 && collected === total;
  return (
    <Stack gap="xs" testID="collection-progress">
      <Row justify="space-between">
        <Text weight="medium" color={colors.textMuted}>
          {label}
        </Text>
        <Text weight="bold" testID="collection-progress-count">
          {t('ui.progress_count', { collected, total })}
        </Text>
      </Row>
      <ProgressBar
        progress={ratio}
        label={t('ui.progress_a11y', { label, collected, count: total })}
        color={isComplete ? colors.success : colors.primary}
      />
    </Stack>
  );
}
