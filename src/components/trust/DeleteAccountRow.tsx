import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../ConfirmDialog';
import { ListRow } from '../primitives/ListRow';
import { Spinner } from '../primitives/Spinner';

export interface DeleteAccountRowProps {
  /** Deletes the account; the dialog closes when it settles (success or a toast-worthy error). */
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  disabled?: boolean;
  /** The row's bottom hairline. Default true. */
  divider?: boolean;
  testID?: string;
}

/**
 * "Delete account" (GDPR right to erasure), shared by Profile and the Privacy and auto-fill screen: a plain hairline
 * row that opens the confirmation dialog. The red destructive button only appears in the dialog,
 * which explains that it cannot be undone. Two deliberate taps.
 */
export function DeleteAccountRow({ onConfirm, isDeleting, disabled = false, divider, testID }: DeleteAccountRowProps) {
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
      <ListRow
        title={t('profile.delete_account')}
        onPress={() => setIsOpen(true)}
        disabled={disabled || isDeleting}
        accessibilityHint={t('profile.delete_account_hint')}
        trailing={isDeleting ? <Spinner size="small" /> : undefined}
        divider={divider}
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
