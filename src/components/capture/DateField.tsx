import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Provenance } from '../../types/Identification';
import { localDateTimeParts, parseLocalDateTime } from '../../utils/captureForm';
import { intlLocale } from '../../utils/intlLocale';
import { InputField } from '../primitives/InputField';
import { Sheet } from '../primitives/Sheet';
import { Stack } from '../primitives/Stack';
import { StyledButton } from '../StyledButton';
import { DetailRow } from './DetailRow';

export interface DateFieldProps {
  /** ISO date-time. */
  value: string;
  onChange: (iso: string) => void;
  /** AUTO when the photo's EXIF (or the camera) filled it in, YOU once edited. */
  provenance?: Provenance;
  testID?: string;
}

/** The date row of the review ("From photo" when EXIF filled it in); tapping it opens a small date sheet. */
export function DateField({ value, onChange, provenance, testID = 'date-field' }: DateFieldProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(localDateTimeParts(value));
  const [isInvalid, setIsInvalid] = useState(false);
  const formatted = Number.isNaN(new Date(value).getTime())
    ? ''
    : new Intl.DateTimeFormat(intlLocale(i18n.language), {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(new Date(value));

  const open = () => {
    setDraft(localDateTimeParts(value));
    setIsInvalid(false);
    setIsOpen(true);
  };
  const apply = () => {
    const iso = parseLocalDateTime(draft.date, draft.time);
    if (iso === undefined) {
      setIsInvalid(true);
      return;
    }
    onChange(iso);
    setIsOpen(false);
  };

  return (
    <>
      <DetailRow
        label={t('capture.date_label')}
        value={formatted}
        provenance={provenance}
        onPress={open}
        accessibilityLabel={`${t('capture.date_label')}: ${formatted}`}
        testID={testID}
      />
      <Sheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('capture.date_sheet_title')}
        testID="date-sheet"
      >
        <Stack gap="md">
          <InputField
            label={t('capture.date_input_label')}
            value={draft.date}
            onChangeText={(date) => setDraft((current) => ({ ...current, date }))}
            maxLength={10}
            error={isInvalid ? t('capture.date_invalid') : undefined}
            testID="date-input"
          />
          <InputField
            label={t('capture.time_input_label')}
            value={draft.time}
            onChangeText={(time) => setDraft((current) => ({ ...current, time }))}
            maxLength={5}
            testID="time-input"
          />
          <StyledButton label={t('capture.date_apply')} onPress={apply} testID="date-apply" />
          <StyledButton
            label={t('capture.date_now')}
            variant="secondary"
            onPress={() => {
              onChange(new Date().toISOString());
              setIsOpen(false);
            }}
            testID="date-now"
          />
        </Stack>
      </Sheet>
    </>
  );
}
