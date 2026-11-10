import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { iconSizes, useMotion, useTheme, type TextTone } from '../../theme';
import { Icon } from './Icon';
import { TONE_TOKENS } from './Text';

interface SpinnerProps {
  size?: 'small' | 'large';
  /** Colour role. Default `text2` (quiet on both schemes). */
  tone?: TextTone;
  /** For components only: an explicit colour that wins over the tone. */
  color?: string;
  testID?: string;
}

export function Spinner({ size = 'small', tone = 'text2', color, testID }: SpinnerProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { reduced } = useMotion();
  if (reduced) {
    // Reduced motion: a still clock with the same "Loading" name instead of a spinning wheel.
    return (
      <View accessible accessibilityRole="progressbar" accessibilityLabel={t('a11y.loading')} testID={testID}>
        <Icon
          name="clock"
          size={size === 'large' ? iconSizes.lg : iconSizes.md}
          color={color ?? colors[TONE_TOKENS[tone]]}
        />
      </View>
    );
  }
  return (
    <ActivityIndicator
      size={size}
      color={color ?? colors[TONE_TOKENS[tone]]}
      accessibilityLabel={t('a11y.loading')}
      testID={testID}
    />
  );
}
