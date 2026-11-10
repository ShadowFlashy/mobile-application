import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import { Icon } from '../primitives/Icon';
import { Text } from '../primitives/Text';

interface FormErrorProps {
  /** Already translated. Nothing is rendered without a message. */
  message?: string;
  testID?: string;
}

/** A form-level error (e.g. wrong credentials): icon plus text, announced by screen readers. */
export function FormError({ message, testID }: FormErrorProps) {
  const styles = useStyles();
  if (message === undefined) return null;
  return (
    <View style={styles.box} accessibilityRole="alert" accessibilityLiveRegion="assertive" testID={testID}>
      <Icon name="alert-circle" size={20} tone="danger" />
      <View style={styles.text}>
        <Text variant="bodyStrong" tone="danger">
          {message}
        </Text>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii }) => ({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.smd,
    borderRadius: radii.md,
    backgroundColor: colors.dangerSoft,
    borderStartWidth: 4,
    borderStartColor: colors.dangerFill,
  },
  text: { flex: 1 },
}));
