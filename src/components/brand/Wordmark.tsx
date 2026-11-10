import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import { Text } from '../primitives/Text';

interface WordmarkProps {
  /** `lg` (default) uses the hero type, `md` the display type. */
  size?: 'md' | 'lg';
  /** `onStage` on the always-dark backdrop. */
  tone?: 'default' | 'onStage';
  testID?: string;
}

/** REDLINE in racing-livery italics, with a red redline bar under it. */
export function Wordmark({ size = 'lg', tone = 'default', testID }: WordmarkProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View
      style={styles.base}
      accessible
      accessibilityRole="header"
      accessibilityLabel={t('common.app_name')}
      testID={testID}
    >
      <Text variant={size === 'lg' ? 'hero' : 'display'} tone={tone === 'onStage' ? 'onStage' : 'default'}>
        {t('common.app_name')}
      </Text>
      <View style={[styles.bar, size === 'lg' ? styles.barLg : styles.barMd]} />
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: { alignSelf: 'flex-start', gap: spacing.xxs },
  bar: { backgroundColor: colors.primary, transform: [{ skewX: '-20deg' }] },
  barLg: { height: 5, width: '62%', marginStart: '38%' },
  barMd: { height: 4, width: '62%', marginStart: '38%' },
}));
