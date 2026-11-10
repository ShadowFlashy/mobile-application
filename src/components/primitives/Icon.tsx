import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, type TextTone } from '../../theme';
import { TONE_TOKENS } from './Text';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  /** Colour role (screens use tones). Default `default`. */
  tone?: TextTone;
  /** For components only (lint-banned in app/**): an explicit colour that wins over the tone. */
  color?: string;
  /** Icons are decorative by default; pass a label when the icon carries meaning on its own. */
  accessibilityLabel?: string;
  testID?: string;
}

export function Icon({ name, size = 24, tone = 'default', color, accessibilityLabel, testID }: IconProps) {
  const { colors } = useTheme();
  return (
    <Ionicons
      name={name}
      size={size}
      color={color ?? colors[TONE_TOKENS[tone]]}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={accessibilityLabel === undefined}
      importantForAccessibility={accessibilityLabel === undefined ? 'no' : 'yes'}
      testID={testID}
    />
  );
}
