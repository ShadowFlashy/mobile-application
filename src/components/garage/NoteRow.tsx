import { View } from 'react-native';
import { createThemedStyles, lines, rowHeights, spacing } from '../../theme';
import { Text } from '../primitives/Text';

interface NoteRowProps {
  /** Already translated; may wrap over several lines. */
  text: string;
  /** `text` for a fact ("Verified on 1 Nov 2026"), `text2` for an explanation. Default `text2`. */
  tone?: 'text' | 'text2';
  /** The bottom hairline. Default true. */
  divider?: boolean;
  testID?: string;
}

/**
 * A paragraph that sits in a hairline list: the same 12 px vertical rhythm as a row, the text in
 * value (15/20) and a bottom hairline, so explanations do not need a box or callout.
 */
export function NoteRow({ text, tone = 'text2', divider = true, testID }: NoteRowProps) {
  const styles = useStyles();
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <Text variant="value" tone={tone} testID={testID}>
        {text}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: { minHeight: rowHeights.default, justifyContent: 'center', paddingVertical: spacing.smd },
  divider: { borderBottomWidth: lines.hairline, borderBottomColor: colors.line },
}));
