import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import { KerbStripe } from '../primitives/KerbStripe';

interface AuthLayoutProps {
  /** The form (brand header, fields, buttons). */
  children: ReactNode;
  /** Links under the form card, e.g. "Create an account" and Privacy. */
  footer?: ReactNode;
  testID?: string;
}

/**
 * The frame of the public auth screens: a kerb stripe, the form on a paper card that stays above
 * the keyboard, and the links under it. Screens only pass content.
 */
export function AuthLayout({ children, footer, testID }: AuthLayoutProps) {
  const styles = useStyles();
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        testID={testID}
      >
        <KerbStripe height={8} />
        <View style={styles.column}>
          <View style={styles.card}>{children}</View>
          {footer !== undefined && <View style={styles.footer}>{footer}</View>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = createThemedStyles(({ colors, elevation, radii }) => ({
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1 },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.raised,
  },
  footer: { gap: spacing.xs },
}));
