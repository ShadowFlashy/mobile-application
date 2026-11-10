import { useId, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, View } from 'react-native';
import { createThemedStyles, lines, spacing, useMotion } from '../theme';
import { Stack } from './primitives/Stack';
import { Text } from './primitives/Text';
import { StyledButton } from './StyledButton';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** The confirm button becomes A's destructive (red) button; the only place it is used. */
  destructive?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
}

/**
 * Confirmation for critical actions such as deleting (error prevention): a flat `raise` dialog with
 * a hairline border and radius 8. Replaces the browser-only alert()/confirm(), so it works the same
 * on web and Android.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  destructive = false,
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { reduced } = useMotion();
  const titleId = useId();
  const messageId = useId();
  return (
    <Modal visible={visible} transparent animationType={reduced ? 'none' : 'fade'} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        {/* An alert dialog named by its title and described by its message (not a nested alert). */}
        <View
          style={styles.dialog}
          role="alertdialog"
          aria-modal
          aria-labelledby={titleId}
          aria-describedby={messageId}
          accessibilityViewIsModal
          testID="confirm-dialog"
        >
          <Stack gap="md" padding="lg">
            <Text variant="heading" heading nativeID={titleId}>
              {title}
            </Text>
            <Text variant="value" tone="text2" nativeID={messageId}>
              {message}
            </Text>
            {children}
            <Stack gap="sm">
              <StyledButton
                label={confirmLabel}
                onPress={onConfirm}
                variant={destructive ? 'destructive' : 'primary'}
                isLoading={isLoading}
                testID="confirm-dialog-confirm"
              />
              <StyledButton
                label={t('common.cancel')}
                onPress={onCancel}
                variant="secondary"
                testID="confirm-dialog-cancel"
              />
            </Stack>
          </Stack>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.gutter,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.raise,
    borderRadius: radii.md,
    borderWidth: lines.hairline,
    borderColor: colors.line,
    overflow: 'hidden',
  },
}));
