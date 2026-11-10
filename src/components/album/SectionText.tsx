import type { ReactNode } from 'react';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';

export interface SectionTextProps {
  /** Paragraphs (`Text`) under a Section heading. */
  children: ReactNode;
  testID?: string;
}

/**
 * Paragraphs under a Section's hairline: 12 px above, 8 between, on the screen's 20 px left edge
 * (vertical spacing only, so the text never steps in from the edge).
 */
export function SectionText({ children, testID }: SectionTextProps) {
  const styles = useStyles();
  return (
    <View style={styles.body} testID={testID}>
      {children}
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  body: { gap: spacing.sm, paddingTop: spacing.smd },
}));
