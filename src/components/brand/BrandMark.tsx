import { Component, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { useTheme } from '../../theme';

interface BrandMarkProps {
  /** Width and height in dp. Default 44. */
  size?: number;
  /** Decorative next to the wordmark (default); pass false when the mark stands alone. */
  decorative?: boolean;
  testID?: string;
}

/**
 * Geometry of the mark on a 64 × 64 grid, shared with W9's `assets/brand/icon-master.svg`:
 * a die-cut white sticker (rx 14), a dark dial (r 22), five ticks, the red zone from 15° to −45°
 * and the needle at −12°, deep in the red zone.
 */
export const BRAND_MARK_GEOMETRY = {
  viewBox: 64,
  center: 32,
  dialRadius: 22,
  tickAngles: [225, 180, 135, 90, 45],
  redZone: { from: 15, to: -45, radius: 17 },
  needleAngle: -12,
  needleLength: 17,
} as const;

/** A point on the dial: degrees counter-clockwise from 3 o'clock, SVG y pointing down. */
function polar(angle: number, radius: number): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  const { center } = BRAND_MARK_GEOMETRY;
  return { x: center + radius * Math.cos(radians), y: center - radius * Math.sin(radians) };
}

function BrandMarkSvg({ size = 44, decorative = true, testID }: BrandMarkProps) {
  const { t } = useTranslation();
  const { colors, instruments } = useTheme();
  const g = BRAND_MARK_GEOMETRY;
  const zoneStart = polar(g.redZone.from, g.redZone.radius);
  const zoneEnd = polar(g.redZone.to, g.redZone.radius);
  const needle = polar(g.needleAngle, g.needleLength);
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${g.viewBox} ${g.viewBox}`}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      accessibilityLabel={decorative ? undefined : t('brand.mark_a11y')}
      testID={testID}
    >
      {/* Die-cut sticker with its cut line. */}
      <Rect
        x={2}
        y={2}
        width={60}
        height={60}
        rx={14}
        fill={instruments.roundel}
        stroke={colors.borderStrong}
        strokeWidth={1}
      />
      {/* The dial. */}
      <Circle cx={g.center} cy={g.center} r={g.dialRadius} fill={instruments.pitBoard} />
      {g.tickAngles.map((angle) => {
        const outer = polar(angle, 18);
        const inner = polar(angle, 13);
        return (
          <Line
            key={angle}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={instruments.pitBoardText}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        );
      })}
      {/* The red zone. */}
      <Path
        d={`M ${zoneStart.x} ${zoneStart.y} A ${g.redZone.radius} ${g.redZone.radius} 0 0 1 ${zoneEnd.x} ${zoneEnd.y}`}
        stroke={colors.primary}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      {/* The needle, deep in the red zone. */}
      <Line
        x1={g.center}
        y1={g.center}
        x2={needle.x}
        y2={needle.y}
        stroke={instruments.pitBoardText}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Circle cx={g.center} cy={g.center} r={4} fill={colors.primary} />
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

/** The Redline mark: a tachometer needle in the red zone, on a die-cut sticker. */
export function BrandMark(props: BrandMarkProps) {
  return (
    <SvgBoundary>
      <BrandMarkSvg {...props} />
    </SvgBoundary>
  );
}
