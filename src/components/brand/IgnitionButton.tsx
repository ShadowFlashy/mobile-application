import { View } from 'react-native';
import { createThemedStyles, useTheme } from '../../theme';
import { Gradient } from '../primitives/Gradient';
import { Icon } from '../primitives/Icon';
import { PressableScale } from '../primitives/PressableScale';
import { Text } from '../primitives/Text';

interface IgnitionButtonProps {
  /** Already translated, e.g. "SPOT". */
  label: string;
  onPress: () => void;
  /** The Spot tab is the current tab. */
  active?: boolean;
  /** Spoken label when it differs from the visible one. */
  accessibilityLabel?: string;
  /** Default `tab` (the centre item of the tab bar). */
  accessibilityRole?: 'tab' | 'button';
  testID?: string;
}

/** Diameter of the red button in dp. */
export const IGNITION_SIZE = 64;
/** How far the button rises above the tab bar. */
export const IGNITION_RAISE = 16;
const RING = 4;

/**
 * The Ignition button: the raised centre of the tab bar that starts a spot. A 64 dp red gradient
 * disc in a chrome ring, with a camera glyph and the label. Presses scale to 0.94 with a tap haptic.
 */
export function IgnitionButton({
  label,
  onPress,
  active = false,
  accessibilityLabel,
  accessibilityRole = 'tab',
  testID,
}: IgnitionButtonProps) {
  const styles = useStyles();
  const { colors, finishes } = useTheme();
  return (
    <View style={styles.slot}>
      <PressableScale
        onPress={onPress}
        scaleTo={0.94}
        haptic="tap"
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel ?? label}
        selected={active}
        testID={testID}
      >
        <View style={styles.ring}>
          <Gradient colors={finishes.rare.edge} direction="diagonal" fill />
          <View style={styles.disc}>
            <Gradient colors={[colors.primary, colors.primaryPressed]} direction="vertical" fill />
            <Icon name={active ? 'camera' : 'camera-outline'} size={26} tone="onPrimary" />
            <Text variant="label" tone="onPrimary">
              {label}
            </Text>
          </View>
        </View>
      </PressableScale>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, elevation, radii, scheme }) => ({
  slot: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', marginTop: -IGNITION_RAISE },
  ring: {
    width: IGNITION_SIZE + RING * 2,
    height: IGNITION_SIZE + RING * 2,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(scheme === 'dark'
      ? { ...elevation.floating, shadowColor: colors.primary, shadowOpacity: 0.55 }
      : elevation.floating),
  },
  disc: {
    width: IGNITION_SIZE,
    height: IGNITION_SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
}));
