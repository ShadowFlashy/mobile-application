import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, radii } from '../../theme';

interface UnreadDotProps {
  testID?: string;
}

const DOT = 8;

/**
 * A's unread marker: a small dot in the text colour (never red). The row around it also says "New"
 * in its accessible label, so the dot is not the only cue.
 */
export function UnreadDot({ testID }: UnreadDotProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View
      style={styles.dot}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('sightings.unread_dot_a11y')}
      testID={testID}
    />
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  dot: { width: DOT, height: DOT, borderRadius: radii.pill, backgroundColor: colors.text },
}));
