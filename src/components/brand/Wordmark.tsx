import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '../primitives/Text';

interface WordmarkProps {
  /** `lg` (default) uses the 34 px title style, `md` the 20 px unit size. */
  size?: 'md' | 'lg';
  /** `onStage` on the always-dark photo stage. */
  tone?: 'default' | 'onStage';
  testID?: string;
}

/** "Redline" in Barlow Condensed 600, upright and in sentence case. No bar, no italics. */
export function Wordmark({ size = 'lg', tone = 'default', testID }: WordmarkProps) {
  const { t } = useTranslation();
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={t('common.app_name')} testID={testID}>
      <Text variant={size === 'lg' ? 'title' : 'num'} tone={tone === 'onStage' ? 'onStage' : 'text'}>
        {t('common.app_name')}
      </Text>
    </View>
  );
}
