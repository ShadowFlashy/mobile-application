import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatDate';
import { StyledButton } from '../StyledButton';
import { StatusRow } from './StatusRow';

export interface DuplicateBannerProps {
  /** When the look-alike spot was saved (ISO). */
  spottedAt: string;
  onView: () => void;
  onSaveAnyway: () => void;
  testID?: string;
}

/** "You already added this photo on 3 Nov" (SPEC P0-21) as a status row: View it, or save this one anyway. */
export function DuplicateBanner({
  spottedAt,
  onView,
  onSaveAnyway,
  testID = 'duplicate-banner',
}: DuplicateBannerProps) {
  const { t, i18n } = useTranslation();
  return (
    <StatusRow
      icon="copy"
      title={t('capture.duplicate_title', { date: formatDate(spottedAt, i18n.language) })}
      actions={
        <>
          <StyledButton label={t('capture.duplicate_view')} variant="text" onPress={onView} testID="duplicate-view" />
          <StyledButton
            label={t('capture.duplicate_save_anyway')}
            variant="text"
            onPress={onSaveAnyway}
            testID="duplicate-save-anyway"
          />
        </>
      }
      testID={testID}
    />
  );
}
