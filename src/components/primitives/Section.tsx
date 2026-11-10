import type { ReactNode } from 'react';
import { View } from 'react-native';
import { createThemedStyles, lines, rowHeights, spacing } from '../../theme';
import { Text } from './Text';

interface SectionProps {
  /** Already translated; the section heading (Barlow 600, 17/24), announced as a header. */
  title?: string;
  /** A quiet text-2 meta on the right of the heading row, e.g. "Ends in 5d 10h". */
  meta?: string;
  /** A text action on the right instead of the meta, e.g. a "See all" StyledButton variant="text". */
  action?: ReactNode;
  /** The hairline between the heading row and the content. Default true when there is a heading. */
  divider?: boolean;
  children: ReactNode;
  testID?: string;
}

/**
 * A's section: a 36 px heading row (title left, meta or text action right, centred on one line), a
 * hairline, then the content. Sections sit 24 apart (Stack gap="lg"); they are never boxed.
 */
export function Section({ title, meta, action, divider, children, testID }: SectionProps) {
  const styles = useStyles();
  const hasHeading = title !== undefined || meta !== undefined || action !== undefined;
  const showDivider = divider ?? hasHeading;
  return (
    <View style={styles.section} testID={testID}>
      {hasHeading && (
        <View style={styles.heading}>
          <View style={styles.titleCell}>
            {title !== undefined && (
              <Text variant="heading" heading level={2} numberOfLines={2}>
                {title}
              </Text>
            )}
          </View>
          {meta !== undefined && action === undefined && (
            <Text variant="meta" tone="text2" align="right">
              {meta}
            </Text>
          )}
          {action !== undefined && <View style={styles.action}>{action}</View>}
        </View>
      )}
      {showDivider && <View style={styles.divider} />}
      {children}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  section: { gap: spacing.none },
  heading: {
    minHeight: rowHeights.sectionHeading,
    flexDirection: 'row',
    // Centred, not baseline: the 44 px text action would otherwise hang below the heading.
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.smd,
  },
  titleCell: { flex: 1, minWidth: 0 },
  // The 44 px text action overlaps the 36 px row, like the mockup's -10 px margins.
  action: { marginVertical: -spacing.sm },
  divider: { height: lines.hairline, backgroundColor: colors.line },
}));
