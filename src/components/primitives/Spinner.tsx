import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type TextTone } from '../../theme';
import { TONE_TOKENS } from './Text';

interface SpinnerProps {
  size?: 'small' | 'large';
  /** Colour role. Default `accent` (readable on light and dark surfaces). */
  tone?: TextTone;
  /** For components only: an explicit colour that wins over the tone. */
  color?: string;
  testID?: string;
}

export function Spinner({ size = 'small', tone = 'accent', color, testID }: SpinnerProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <ActivityIndicator
      size={size}
      color={color ?? colors[TONE_TOKENS[tone]]}
      accessibilityLabel={t('a11y.loading')}
      testID={testID}
    />
  );
}
