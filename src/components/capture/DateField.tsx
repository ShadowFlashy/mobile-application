import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Provenance } from '../../types/Identification';
import { Icon } from '../primitives/Icon';
import { InputField } from '../primitives/InputField';
import { Row } from '../primitives/Row';
import { Sheet } from '../primitives/Sheet';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Text } from '../primitives/Text';
import { StyledButton } from '../StyledButton';
import { localDateTimeParts, parseLocalDateTime } from '../../utils/captureForm';
import { ProvenanceTag } from './ProvenanceTag';

export interface DateFieldProps {
  /** ISO date-time. */
  value: string;
  onChange: (iso: string) => void;
  /** AUTO when the photo's EXIF (or the camera) filled it in, YOU once edited. */
  provenance?: Provenance;
  testID?: string;
}

/** When the car was spotted, with its AUTO tag from EXIF; tapping it opens a small date sheet. */
export function DateField({ value, onChange, provenance, testID = 'date-field' }: DateFieldProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(localDateTimeParts(value));
  const [isInvalid, setIsInvalid] = useState(false);
  const formatted = Number.isNaN(new Date(value).getTime())
    ? ''
    : new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

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
      <Surface
        variant="flat"
        padding="smd"
        onPress={open}
        accessibilityLabel={`${t('capture.date_label')}: ${formatted}`}
        testID={testID}
      >
        <Row gap="smd" align="center">
          <Icon name="calendar" tone="muted" />
          <Stack gap="xxs" flex={1}>
            <Text variant="caption" tone="muted">
              {t('capture.date_label')}
            </Text>
            <Text variant="bodyStrong" testID={`${testID}-value`}>
              {formatted}
            </Text>
          </Stack>
          {provenance !== undefined && <ProvenanceTag provenance={provenance} />}
          <Icon name="chevron-forward" tone="subtle" size={18} />
        </Row>
      </Surface>
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
            variant="ghost"
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
