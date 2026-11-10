import Svg, { Circle, Path } from 'react-native-svg';
import {
  SILHOUETTE_VIEWBOX,
  SILHOUETTE_WHEEL_RADIUS,
  SILHOUETTE_WHEEL_Y,
  SILHOUETTES,
} from '../../constants/silhouettes';
import { useTheme } from '../../theme';
import type { BodyStyle } from '../../types/CarModel';
import { Icon } from '../primitives/Icon';
import { SvgFallback } from './SvgFallback';

export type CarSilhouetteTone = 'silhouette' | 'onStage';

export interface CarSilhouetteProps {
  bodyStyle: BodyStyle;
  /** Width in dp; the height follows the 120×48 viewBox (40 %). */
  size: number;
  tone: CarSilhouetteTone;
}

/**
 * The decal-like side profile of a body style, the artwork of an empty album slot. Decorative: the
 * slot itself carries the accessible label. Falls back to the Ionicon `car-sport` without SVG.
 */
export function CarSilhouette({ bodyStyle, size, tone }: CarSilhouetteProps) {
  const { colors } = useTheme();
  const fill = tone === 'onStage' ? colors.onStageMuted : colors.silhouette;
  const spec = SILHOUETTES[bodyStyle];
  const height = (size * SILHOUETTE_VIEWBOX.height) / SILHOUETTE_VIEWBOX.width;
  return (
    <SvgFallback fallback={<Icon name="car-sport" size={Math.round(height)} color={fill} />}>
      <Svg
        width={size}
        height={height}
        viewBox={`0 0 ${SILHOUETTE_VIEWBOX.width} ${SILHOUETTE_VIEWBOX.height}`}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        testID={`silhouette-${bodyStyle}`}
      >
        <Path d={spec.path} fill={fill} fillRule="evenodd" />
        {spec.wheels.map((cx) => (
          <Circle key={cx} cx={cx} cy={SILHOUETTE_WHEEL_Y} r={SILHOUETTE_WHEEL_RADIUS} fill={fill} />
        ))}
      </Svg>
    </SvgFallback>
  );
}
