import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputField } from '../primitives/InputField';
import { StyledButton } from '../StyledButton';

export interface NotesFieldProps {
  value: string;
  onChange: (notes: string) => void;
  testID?: string;
}

/** Private notes, collapsed behind "Add a note" so the minimal path stays one screen of taps. */
export function NotesField({ value, onChange, testID = 'notes-field' }: NotesFieldProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(value.length > 0);
  if (!isOpen) {
    return (
      <StyledButton
        label={t('capture.notes_add')}
        variant="ghost"
        icon="create-outline"
        onPress={() => setIsOpen(true)}
        testID={`${testID}-open`}
      />
    );
  }
  return (
    <InputField
      label={t('capture.notes_label')}
      value={value}
      onChangeText={onChange}
      placeholder={t('capture.notes_placeholder')}
      autoCapitalize="sentences"
      multiline
      maxLength={500}
      testID="notes-input"
    />
  );
}
