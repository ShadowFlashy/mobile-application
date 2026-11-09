import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  /** Defaults to the theme's text colour. */
  color?: string;
  /** Icons are decorative by default; pass a label when the icon carries meaning on its own. */
  accessibilityLabel?: string;
}

export function Icon({ name, size = 24, color, accessibilityLabel }: IconProps) {
  const { colors } = useTheme();
  return (
    <Ionicons
      name={name}
      size={size}
      color={color ?? colors.text}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={accessibilityLabel === undefined}
      importantForAccessibility={accessibilityLabel === undefined ? 'no' : 'yes'}
    />
  );
}
