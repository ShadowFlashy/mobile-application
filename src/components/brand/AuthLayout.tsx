import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';

interface AuthLayoutProps {
  /** The form (brand header, fields, buttons). */
  children: ReactNode;
  /** Links under the form, e.g. "Create an account" and Privacy. */
  footer?: ReactNode;
  testID?: string;
}

/**
 * The frame of the public auth screens: a plain centred column on the background, 20 px margins,
 * kept above the keyboard, with the links under the form. No card, no stripe. Screens only pass
 * content.
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
        <View style={styles.column}>
          <View style={styles.form}>{children}</View>
          {footer !== undefined && <View style={styles.footer}>{footer}</View>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1 },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  form: { gap: spacing.md },
  footer: { gap: spacing.xs },
}));
