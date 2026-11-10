import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../ConfirmDialog';
import { StyledButton } from '../StyledButton';

export interface DeleteAccountButtonProps {
  /** Deletes the account; the dialog closes when it settles (success or a toast-worthy error). */
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  disabled?: boolean;
  testID?: string;
}

/**
 * "Delete my account" with its confirmation dialog (GDPR right to erasure), shared by Me and the
 * Trust Center. Two deliberate taps; the dialog explains that it cannot be undone.
 */
export function DeleteAccountButton({ onConfirm, isDeleting, disabled = false, testID }: DeleteAccountButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const confirm = async () => {
    try {
      await onConfirm();
    } catch {
      // The caller reports the error (a toast); the dialog only has to get out of the way.
    } finally {
      // Closed in both cases: a toast is not visible on top of an open dialog.
      setIsOpen(false);
    }
  };

  return (
    <>
      <StyledButton
        label={t('profile.delete_account')}
        icon="trash-outline"
        variant="ghost"
        onPress={() => setIsOpen(true)}
        disabled={disabled || isDeleting}
        accessibilityHint={t('profile.delete_account_hint')}
        testID={testID}
      />
      <ConfirmDialog
        visible={isOpen}
        title={t('profile.delete_title')}
        message={t('profile.delete_message')}
        confirmLabel={t('profile.delete_account')}
        destructive
        isLoading={isDeleting}
        onConfirm={() => void confirm()}
        onCancel={() => setIsOpen(false)}
      />
    </>
  );
}
