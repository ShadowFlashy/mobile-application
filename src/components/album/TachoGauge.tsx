import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { createThemedStyles, useTheme } from '../../theme';
import { gaugeArcPath, needleAngle, polarPoint, TACHO_RED_ZONE } from '../../utils/album';
import { ProgressBar } from '../primitives/ProgressBar';
import { Text } from '../primitives/Text';
import { SvgFallback } from './SvgFallback';

export type TachoGaugeSize = 'md' | 'lg';

export interface TachoGaugeProps {
  /** 0–1 */
  ratio: number;
  /** Accessible name, e.g. "Album completion". */
  label: string;
  /** Shown in the dial, e.g. "24 %". */
  valueLabel: string;
  size: TachoGaugeSize;
  testID?: string;
}

const DIMENSION: Record<TachoGaugeSize, number> = { md: 148, lg: 196 };
const TICKS = 10;

/**
 * A tachometer of album completion. The dial sweeps 270°, the red zone covers the last 15 %, and
 * the needle points at the completion. Falls back to a progress bar if SVG is unavailable.
 */
export function TachoGauge({ ratio, label, valueLabel, size, testID }: TachoGaugeProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const clamped = Math.min(1, Math.max(0, Number.isFinite(ratio) ? ratio : 0));
  const percent = Math.round(clamped * 100);
  const dimension = DIMENSION[size];
  const c = dimension / 2;
  const radius = c - 10;
  const redStart = 1 - TACHO_RED_ZONE;
  const needleTip = polarPoint(c, c, radius - 14, needleAngle(clamped));
  const inRedZone = clamped >= redStart;

  return (
    <View
      style={[styles.wrap, { width: dimension, height: dimension }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent, text: valueLabel }}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      testID={testID}
    >
      <SvgFallback fallback={<ProgressBar progress={clamped} label={label} />}>
        <Svg
          width={dimension}
          height={dimension}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Path
            d={gaugeArcPath(c, c, radius, 0, 1)}
            stroke={colors.surfaceSunken}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={gaugeArcPath(c, c, radius + 7, redStart, 1)}
            stroke={colors.primary}
            strokeWidth={4}
            fill="none"
            testID="tacho-red-zone"
          />
          {clamped > 0 && (
            <Path
              d={gaugeArcPath(c, c, radius, 0, clamped)}
              stroke={inRedZone ? colors.primary : colors.text}
              strokeWidth={10}
              fill="none"
              strokeLinecap="round"
              testID="tacho-fill"
            />
          )}
          {Array.from({ length: TICKS + 1 }, (_, index) => {
            const angle = needleAngle(index / TICKS);
            const outer = polarPoint(c, c, radius - 8, angle);
            const inner = polarPoint(c, c, radius - (index % 5 === 0 ? 16 : 12), angle);
            return (
              <Line
                key={index}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={index / TICKS > redStart ? colors.accent : colors.textSubtle}
                strokeWidth={index % 5 === 0 ? 2 : 1}
              />
            );
          })}
          <Line
            x1={c}
            y1={c}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke={colors.accent}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Circle cx={c} cy={c} r={5} fill={colors.text} />
        </Svg>
      </SvgFallback>
      <View style={styles.readout} pointerEvents="none">
        <Text
          variant={size === 'lg' ? 'number' : 'numberSm'}
          testID={testID !== undefined ? `${testID}-value` : undefined}
        >
          {valueLabel}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ spacing }) => ({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  readout: { position: 'absolute', bottom: spacing.sm, left: 0, right: 0, alignItems: 'center' },
}));
