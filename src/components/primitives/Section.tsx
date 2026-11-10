import type { ReactNode } from 'react';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import { Text } from './Text';

interface SectionProps {
  /** Already translated; rendered as an uppercase label heading. */
  title?: string;
  /** Shown at the end of the title row, e.g. a "See all" button. */
  action?: ReactNode;
  children: ReactNode;
  testID?: string;
}

/** A titled block of content with consistent spacing between sections. */
export function Section({ title, action, children, testID }: SectionProps) {
  const styles = useStyles();
  return (
    <View style={styles.section} testID={testID}>
      {(title !== undefined || action !== undefined) && (
        <View style={styles.header}>
          <View style={styles.titleCell}>
            {title !== undefined && (
              <Text variant="label" tone="muted" heading>
                {title}
              </Text>
            )}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  section: { gap: spacing.smd },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  titleCell: { flex: 1 },
}));
