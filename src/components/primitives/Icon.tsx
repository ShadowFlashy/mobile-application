import { Component, type ReactNode } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme, type TextTone } from '../../theme';
import { ICONS, resolveIcon, type IconName } from './icons';
import { TONE_TOKENS } from './Text';

export type { AIconName, IconName } from './icons';

interface IconProps {
  name: IconName;
  /** Default 24 (A's grid). Use 20 or 16 only inside dense rows. */
  size?: number;
  /** Colour role (screens use tones). Default `text`. */
  tone?: TextTone;
  /** For components only (lint-banned in app/**): an explicit colour that wins over the tone. */
  color?: string;
  /** Icons are decorative by default; pass a label when the icon carries meaning on its own. */
  accessibilityLabel?: string;
  testID?: string;
}

/** A's stroke weight on the 24 grid (the viewBox scales it with the icon). */
const STROKE = 1.75;

function IconSvg({ name, size = 24, tone = 'text', color, accessibilityLabel, testID }: IconProps) {
  const { colors } = useTheme();
  const ink = color ?? colors[TONE_TOKENS[tone]];
  const shapes = ICONS[resolveIcon(name)];
  const decorative = accessibilityLabel === undefined;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={ink}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      aria-hidden={decorative ? true : undefined}
      testID={testID}
    >
      {shapes.map((shape, index) =>
        'c' in shape ? (
          <Circle key={index} cx={shape.c[0]} cy={shape.c[1]} r={shape.c[2]} />
        ) : (
          <Path key={index} d={shape.d} />
        ),
      )}
    </Svg>
  );
}

interface BoundaryState {
  failed: boolean;
}

/** If react-native-svg fails on a platform, the icon disappears instead of the screen. */
class IconBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Direction A's stroke icons (24 grid, 1.75 stroke, round caps and joins, one colour). Names are A
 * names (`album`, `camera`, `chevron-right`…); deprecated Ionicons names map onto them.
 */
export function Icon(props: IconProps) {
  return (
    <IconBoundary>
      <IconSvg {...props} />
    </IconBoundary>
  );
}
