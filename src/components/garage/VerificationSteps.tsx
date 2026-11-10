import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { columns, createThemedStyles, lines, rowHeights, spacing } from '../../theme';
import { Icon } from '../primitives/Icon';
import { Section } from '../primitives/Section';
import { Text } from '../primitives/Text';

export type VerificationStepState = 'done' | 'current' | 'todo';

export interface VerificationStep {
  /** Stable React key and testID suffix. */
  key: string;
  /** Already translated. */
  title: string;
  /** An optional plain explanation under the title. */
  body?: string;
  /** Progress through the steps; without it the steps are plain instructions. */
  state?: VerificationStepState;
}

interface VerificationStepsProps {
  /** Already translated section heading ("How it works"). */
  title: string;
  steps: readonly VerificationStep[];
  testID?: string;
}

/**
 * Numbered steps as hairline rows: the step number in condensed text-2 (01, 02, 03), the title and
 * an optional explanation. A finished step shows a check instead of its number and recedes to
 * text-2; the current one is in the text colour. Each row is read as "Step 2 of 3: …. In progress".
 */
export function VerificationSteps({ title, steps, testID = 'verification-steps' }: VerificationStepsProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <Section title={title} testID={testID}>
      {steps.map((step, index) => {
        const number = String(index + 1).padStart(2, '0');
        const done = step.state === 'done';
        const stateLabel = step.state !== undefined ? t(`verify.step_${step.state}`) : undefined;
        return (
          <View
            key={step.key}
            style={styles.row}
            accessible
            accessibilityLabel={[
              t('verify.step_a11y', {
                number: index + 1,
                total: steps.length,
                title: step.title,
                state: stateLabel ?? '',
              }),
              step.body,
            ]
              .filter(Boolean)
              .join(' ')}
            testID={`${testID}-${step.key}`}
          >
            <View style={styles.number}>
              {done ? (
                <Icon name="check" size={20} tone="text" />
              ) : (
                <Text variant="numS" tone="text2">
                  {number}
                </Text>
              )}
            </View>
            <View style={styles.text}>
              <Text variant="body" tone={done ? 'text2' : 'text'}>
                {step.title}
              </Text>
              {step.body !== undefined && (
                <Text variant="meta" tone="text2">
                  {step.body}
                </Text>
              )}
            </View>
            {stateLabel !== undefined && (
              <Text
                variant="meta"
                tone={step.state === 'current' ? 'text' : 'text2'}
                testID={`${testID}-${step.key}-state`}
              >
                {stateLabel}
              </Text>
            )}
          </View>
        );
      })}
    </Section>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    minHeight: rowHeights.tall,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.smd,
    paddingVertical: spacing.smd,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  number: { minWidth: columns.step, minHeight: rowHeights.compact / 2, justifyContent: 'center' },
  text: { flex: 1, minWidth: 0, gap: spacing.xs },
}));
