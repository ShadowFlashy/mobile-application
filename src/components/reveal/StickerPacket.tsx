import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, View } from 'react-native';
import { createThemedStyles, easings, useMotion, useTheme } from '../../theme';
import { BrandMark } from '../brand/BrandMark';
import { Gradient } from '../primitives/Gradient';
import { KerbStripe } from '../primitives/KerbStripe';
import { PressableScale } from '../primitives/PressableScale';
import { Text } from '../primitives/Text';

export interface StickerPacketProps {
  /** Called once when the user taps the packet to tear it open. */
  onOpen: () => void;
  /** Plays the tear: the crimped top flies off and the packet drops away. */
  torn: boolean;
  /** Season printed on the packet. Default 1. */
  season?: number;
  testID?: string;
}

/** Packet size: the sticker's 3:4 proportions. */
const PACKET_WIDTH = 216;
const PACKET_HEIGHT = 288;
/** Height of the crimped strip that tears off. */
const CRIMP_HEIGHT = 44;

/**
 * The sealed chrome-foil sticker packet at the start of the reveal (SPEC P0-15 step 1–2). Tapping it
 * tears it open; when `torn` turns true the crimp flies off and the packet falls away, revealing
 * the sticker behind it. With reduced motion it simply disappears.
 */
export function StickerPacket({ onOpen, torn, season = 1, testID }: StickerPacketProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { finishes, instruments } = useTheme();
  const { reduced, duration, nativeDriver } = useMotion();
  const tear = useRef(new Animated.Value(0)).current;
  const opened = useRef(false);

  useEffect(() => {
    if (!torn) {
      tear.setValue(0);
      return undefined;
    }
    if (reduced) {
      tear.setValue(1);
      return undefined;
    }
    const animation = Animated.timing(tear, {
      toValue: 1,
      duration: duration('flip'),
      easing: easings.launch,
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [torn, reduced, duration, nativeDriver, tear]);

  const crimpStyle = {
    opacity: tear.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] }),
    transform: [
      { translateY: tear.interpolate({ inputRange: [0, 1], outputRange: [0, -120] }) },
      { translateX: tear.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }) },
      { rotate: tear.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-18deg'] }) },
    ],
  };
  const bodyStyle = {
    opacity: tear.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 1, 0] }),
    transform: [{ translateY: tear.interpolate({ inputRange: [0, 1], outputRange: [0, 160] }) }],
  };

  const open = () => {
    if (opened.current || torn) return;
    opened.current = true;
    onOpen();
  };

  return (
    <PressableScale
      onPress={open}
      scaleTo={0.97}
      accessibilityLabel={t('reveal.packet_label')}
      accessibilityHint={t('reveal.packet_hint')}
      disabled={torn}
      testID={testID}
    >
      <View style={styles.packet}>
        <Animated.View style={[styles.crimp, crimpStyle]}>
          <Gradient colors={finishes.rare.edge} direction="horizontal" fill />
          <View style={styles.teeth} />
          <KerbStripe height={4} />
        </Animated.View>
        <Animated.View style={[styles.body, bodyStyle]}>
          <Gradient colors={finishes.rare.edge} direction="diagonal" fill />
          <View style={styles.tearLine} />
          <View style={styles.content}>
            <BrandMark size={64} decorative />
            <Text variant="display" color={instruments.roundelInk} align="center">
              {t('common.app_name')}
            </Text>
            <Text variant="label" color={instruments.roundelInk} align="center">
              {t('reveal.packet_season', { season })}
            </Text>
          </View>
          <View style={styles.tapPlate}>
            <Text variant="label" tone="onSignal" align="center">
              {t('reveal.packet_tap')}
            </Text>
          </View>
        </Animated.View>
      </View>
    </PressableScale>
  );
}

const useStyles = createThemedStyles(({ colors, instruments, radii, spacing, elevation }) => ({
  packet: { width: PACKET_WIDTH, height: PACKET_HEIGHT, alignSelf: 'center' },
  crimp: {
    height: CRIMP_HEIGHT,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    ...elevation.sticker,
  },
  teeth: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.sm,
    right: spacing.sm,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: instruments.roundelInk,
    opacity: 0.35,
  },
  body: {
    flex: 1,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
    overflow: 'hidden',
    justifyContent: 'space-between',
    ...elevation.lifted,
  },
  tearLine: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: instruments.roundelInk,
    opacity: 0.5,
  },
  content: { alignItems: 'center', gap: spacing.xs, paddingTop: spacing.lg, paddingHorizontal: spacing.md },
  tapPlate: {
    margin: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.signal,
  },
}));
