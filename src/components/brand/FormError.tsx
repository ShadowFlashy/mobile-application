import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import { Icon } from '../primitives/Icon';
import { Text } from '../primitives/Text';

interface FormErrorProps {
  /** Already translated. Nothing is rendered without a message. */
  message?: string;
  testID?: string;
}

/**
 * A form-level error (e.g. wrong credentials): an alert icon plus text in the text colour, never red
 * text or a coloured box, announced by screen readers.
 */
export function FormError({ message, testID }: FormErrorProps) {
  const styles = useStyles();
  if (message === undefined) return null;
  return (
    <View style={styles.row} accessibilityRole="alert" accessibilityLiveRegion="assertive" testID={testID}>
      <Icon name="alert" size={20} tone="text" />
      <View style={styles.text}>
        <Text variant="body">{message}</Text>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  text: { flex: 1 },
}));
