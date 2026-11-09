import { TextInput, View } from 'react-native';
import { createThemedStyles, fontSizes, radii, spacing, touchTarget, useTheme } from '../../theme';
import { Icon } from './Icon';
import { Text } from './Text';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  /** Helper text shown under the field when there is no error. */
  hint?: string;
  testID?: string;
  keyboardType?: 'default' | 'email-address';
  autoComplete?: 'email' | 'password' | 'new-password' | 'username' | 'off';
  /** iOS autofill hint (keychain / password managers), the counterpart of autoComplete. */
  textContentType?: 'emailAddress' | 'password' | 'newPassword' | 'username' | 'none';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  maxLength?: number;
  onSubmitEditing?: () => void;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  hint,
  testID,
  keyboardType = 'default',
  autoComplete = 'off',
  textContentType,
  autoCapitalize = 'none',
  multiline = false,
  maxLength,
  onSubmitEditing,
}: InputFieldProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View>
      <Text size="sm" weight="medium">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        secureTextEntry={secureTextEntry}
        style={[styles.input, multiline && styles.multiline, error !== undefined && styles.inputError]}
        testID={testID}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
      />
      {/* The live region stays mounted (collapsable={false} keeps its native view), so screen
          readers announce an error as soon as it appears. */}
      <View accessibilityLiveRegion="polite" collapsable={false}>
        {error !== undefined && (
          <View style={styles.error}>
            {/* Icon + text: the error is not shown by colour alone (course ch. 19). */}
            <Icon name="alert-circle" size={16} color={colors.danger} />
            <View style={styles.errorText}>
              <Text size="sm" color={colors.danger} testID={testID !== undefined ? `${testID}-error` : undefined}>
                {error}
              </Text>
            </View>
          </View>
        )}
      </View>
      {error === undefined && hint !== undefined && (
        <View style={styles.hint}>
          <Text size="sm" color={colors.textMuted}>
            {hint}
          </Text>
        </View>
      )}
    </View>
  );
}

// Margins instead of a gap on the container, so the empty live region adds no extra space.
const useStyles = createThemedStyles(({ colors }) => ({
  input: {
    marginTop: spacing.xs,
    minHeight: touchTarget,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginTop: spacing.xs },
  errorText: { flex: 1 },
  hint: { marginTop: spacing.xs },
}));
