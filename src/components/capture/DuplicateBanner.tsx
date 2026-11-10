import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatDate';
import { Icon } from '../primitives/Icon';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Tag } from '../primitives/Tag';
import { Text } from '../primitives/Text';

export interface DuplicateBannerProps {
  /** When the look-alike spot was saved (ISO). */
  spottedAt: string;
  onView: () => void;
  onSaveAnyway: () => void;
  testID?: string;
}

/** "You already added this photo on 3 Nov" (SPEC P0-21): View it, or save this one anyway. */
export function DuplicateBanner({
  spottedAt,
  onView,
  onSaveAnyway,
  testID = 'duplicate-banner',
}: DuplicateBannerProps) {
  const { t, i18n } = useTranslation();
  return (
    <Surface variant="sunken" padding="smd" testID={testID}>
      <Stack gap="sm">
        <Row gap="sm" align="flex-start">
          <Icon name="copy-outline" tone="warning" />
          <Stack flex={1}>
            <Text variant="bodyStrong">
              {t('capture.duplicate_title', { date: formatDate(spottedAt, i18n.language) })}
            </Text>
          </Stack>
        </Row>
        <Row gap="sm" wrap>
          <Tag label={t('capture.duplicate_view')} icon="eye-outline" onPress={onView} testID="duplicate-view" />
          <Tag
            label={t('capture.duplicate_save_anyway')}
            icon="checkmark"
            onPress={onSaveAnyway}
            testID="duplicate-save-anyway"
          />
        </Row>
      </Stack>
    </Surface>
  );
}
