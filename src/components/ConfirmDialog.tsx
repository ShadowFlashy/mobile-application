import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, View } from 'react-native';
import { createThemedStyles, spacing } from '../theme';
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
  destructive?: boolean;
  isLoading?: boolean;
  children?: ReactNode;
}

/**
 * Confirmation for critical actions such as deleting (error prevention). Replaces the browser-only
 * alert()/confirm(), so it works the same on web and Android.
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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityRole="alert" accessibilityViewIsModal testID="confirm-dialog">
          <View style={[styles.stripe, destructive && styles.stripeDanger]} />
          <Stack gap="md" padding="lg">
            <Text variant="title" heading>
              {title}
            </Text>
            <Text tone="muted">{message}</Text>
            {children}
            <StyledButton
              label={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? 'danger' : 'primary'}
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
        </View>
      </View>
    </Modal>
  );
}

const useStyles = createThemedStyles(({ colors, elevation, radii }) => ({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...elevation.floating,
  },
  stripe: { height: 6, backgroundColor: colors.inverseSurface },
  stripeDanger: { backgroundColor: colors.dangerFill },
}));
