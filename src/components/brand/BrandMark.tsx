import { Component, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useTheme } from '../../theme';

interface BrandMarkProps {
  /** Width and height in dp. Default 32. */
  size?: number;
  /** Decorative next to the wordmark (default); pass false when the mark stands alone. */
  decorative?: boolean;
  testID?: string;
}

/**
 * Geometry of the mark on a 64 × 64 grid: a ¾ dial arc (from 225° round to −45°, gap at the bottom),
 * a short red zone at the end of the scale, and the needle pointing into it. Angles are degrees
 * counter-clockwise from 3 o'clock.
 */
export const BRAND_MARK_GEOMETRY = {
  viewBox: 64,
  center: 32,
  dialRadius: 24,
  dial: { from: 225, to: -45 },
  redZone: { from: 10, to: -45 },
  needleAngle: -20,
  needleLength: 19,
  stroke: 4,
} as const;

/** A point on the dial: degrees counter-clockwise from 3 o'clock, SVG y pointing down. */
function polar(angle: number, radius: number): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  const { center } = BRAND_MARK_GEOMETRY;
  return { x: center + radius * Math.cos(radians), y: center - radius * Math.sin(radians) };
}

/** An SVG arc path clockwise on screen from one dial angle to a lower one. */
function arc(from: number, to: number, radius: number): string {
  const start = polar(from, radius);
  const end = polar(to, radius);
  const largeArc = from - to > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function BrandMarkSvg({ size = 32, decorative = true, testID }: BrandMarkProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const g = BRAND_MARK_GEOMETRY;
  const needle = polar(g.needleAngle, g.needleLength);
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${g.viewBox} ${g.viewBox}`}
      fill="none"
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      accessibilityLabel={decorative ? undefined : t('brand.mark_a11y')}
      testID={testID}
    >
      {/* The ¾ dial in the text colour, up to where the red zone starts. */}
      <Path
        d={arc(g.dial.from, g.redZone.from, g.dialRadius)}
        stroke={colors.text}
        strokeWidth={g.stroke}
        strokeLinecap="round"
      />
      {/* The single red zone at the end of the scale. */}
      <Path
        d={arc(g.redZone.from, g.redZone.to, g.dialRadius)}
        stroke={colors.red}
        strokeWidth={g.stroke}
        strokeLinecap="round"
      />
      {/* The needle, pointing into the red zone. */}
      <Line
        x1={g.center}
        y1={g.center}
        x2={needle.x}
        y2={needle.y}
        stroke={colors.text}
        strokeWidth={g.stroke}
        strokeLinecap="round"
      />
      <Circle cx={g.center} cy={g.center} r={3} fill={colors.text} />
    </Svg>
  );
}

interface BoundaryState {
  failed: boolean;
}

/** If react-native-svg fails on a platform, the mark disappears and the wordmark stands alone. */
class SvgBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** The Redline mark: a monochrome rev counter whose needle points into its one red zone. */
export function BrandMark(props: BrandMarkProps) {
  return (
    <SvgBoundary>
      <BrandMarkSvg {...props} />
    </SvgBoundary>
  );
}
