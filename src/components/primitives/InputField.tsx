import { useId, useState } from 'react';
import { TextInput, View } from 'react-native';
import { createThemedStyles, lines, spacing, textVariants, touchTarget, useTheme } from '../../theme';
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

/**
 * A's text field: the label above in meta / text-2, the field on `raise` with radius 8 and a 1 px
 * `line` border; focus turns the border text colour. Errors are an icon plus text (never red).
 */
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
  const [isFocused, setIsFocused] = useState(false);
  // Web drops accessibilityHint, so the error or hint is tied to the field with aria-describedby.
  const errorId = useId();
  const hintId = useId();
  const describedBy = error !== undefined ? errorId : hint !== undefined ? hintId : undefined;
  return (
    <View>
      <Text variant="meta" tone="text2">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text2}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          multiline && styles.multiline,
          error !== undefined && styles.inputError,
          isFocused && styles.inputFocused,
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
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
        aria-describedby={describedBy}
        aria-invalid={error !== undefined}
      />
      {/* The live region stays mounted (collapsable={false} keeps its native view), so screen
          readers announce an error as soon as it appears. */}
      <View accessibilityLiveRegion="polite" collapsable={false}>
        {error !== undefined && (
          <View style={styles.error}>
            {/* Icon + text: the error is never shown by colour alone. */}
            <Icon name="alert" size={16} tone="text" />
            <View style={styles.errorText}>
              <Text
                variant="meta"
                tone="text"
                nativeID={errorId}
                testID={testID !== undefined ? `${testID}-error` : undefined}
              >
                {error}
              </Text>
            </View>
          </View>
        )}
      </View>
      {error === undefined && hint !== undefined && (
        <View style={styles.hint}>
          <Text variant="meta" tone="text2" nativeID={hintId}>
            {hint}
          </Text>
        </View>
      )}
    </View>
  );
}

// Margins instead of a gap on the container, so the empty live region adds no extra space.
const useStyles = createThemedStyles(({ colors, radii }) => ({
  input: {
    // 17 px text: iOS Safari zooms into inputs under 16 px.
    ...textVariants.bodyL,
    marginTop: spacing.xs,
    minHeight: touchTarget + 4,
    borderWidth: lines.hairline,
    // `field`, not `line`: the outline of a control needs 3:1 against the screen (WCAG 1.4.11).
    borderColor: colors.field,
    borderRadius: radii.md,
    backgroundColor: colors.raise,
    paddingHorizontal: spacing.smd,
    paddingVertical: spacing.sm,
    color: colors.text,
  },
  inputFocused: { borderColor: colors.text },
  // An invalid field gets a 2 px text-colour border next to the icon + message.
  inputError: { borderColor: colors.text, borderWidth: lines.progress },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginTop: spacing.xs },
  errorText: { flex: 1 },
  hint: { marginTop: spacing.xs },
}));
