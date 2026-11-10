import type { ReactNode } from 'react';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../theme';
import { Section } from './primitives/Section';
import { Text } from './primitives/Text';

interface PrivacyNoticeProps {
  /** Already translated title, shown as the section heading. */
  title: string;
  /** Already translated explanation. */
  children: ReactNode;
  testID?: string;
}

/**
 * Explains a privacy rule right where it matters (GDPR transparency). Direction A has no callouts: it
 * is an ordinary section (heading row and hairline) with the explanation as a text-2 paragraph.
 */
export function PrivacyNotice({ title, children, testID }: PrivacyNoticeProps) {
  const styles = useStyles();
  return (
    <Section title={title} testID={testID}>
      <View style={styles.body}>
        <Text variant="value" tone="text2">
          {children}
        </Text>
      </View>
    </Section>
  );
}

const useStyles = createThemedStyles(() => ({
  body: { paddingTop: spacing.smd },
}));
