import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';

interface SpinnerProps {
  size?: 'small' | 'large';
  /** Defaults to the theme's accent colour (readable on light and dark surfaces). */
  color?: string;
  testID?: string;
}

export function Spinner({ size = 'small', color, testID }: SpinnerProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <ActivityIndicator
      size={size}
      color={color ?? colors.accent}
      accessibilityLabel={t('a11y.loading')}
      testID={testID}
    />
  );
}
