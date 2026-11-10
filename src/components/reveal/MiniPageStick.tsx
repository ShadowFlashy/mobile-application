import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, View, type LayoutChangeEvent } from 'react-native';
import { createThemedStyles, springs, useMotion } from '../../theme';
import type { AlbumPageData } from '../../types/Album';
import { slotRect } from '../../utils/album';
import { AlbumPage } from '../album/AlbumPage';

export interface MiniPageStickProps {
  /** The album page the sticker goes on (rendered compact). */
  page: AlbumPageData;
  /** The car's slot, highlighted on the page. */
  highlightModelId?: string;
  /** Index of the slot on the page (undefined on Wildcards: the sticker fades into the page). */
  slotIndex?: number;
  /** The sticker that flies into the slot. */
  sticker: ReactNode;
  /** Play the stick animation. Default true; false shows the page with the sticker already in. */
  animate?: boolean;
  /** Called once the sticker sits in its slot (at once without animation). */
  onStuck?: () => void;
  testID?: string;
}

/** The visible window onto the mini page; longer pages scroll so the slot sits in the middle. */
const WINDOW_HEIGHT = 300;
/** Columns of the compact album page (W5's AlbumPage `compact`). */
const MINI_PAGE_COLUMNS = 3;
/** How big the sticker is when it starts its flight, relative to its slot. */
const START_SCALE = 2.2;

interface Measure {
  width: number;
  height: number;
}

/**
 * Stick it (SPEC P0-15 step 8): the sticker shrinks from the middle of the stage into its slot on a
 * compact album page, then hands over to the page's own (now collected) slot. The slot position
 * comes from `slotRect`, the same 2-column geometry as the album grid (D-18). With reduced motion
 * the page simply shows the sticker in place.
 */
export function MiniPageStick({
  page,
  highlightModelId,
  slotIndex,
  sticker,
  animate = true,
  onStuck,
  testID,
}: MiniPageStickProps) {
  const styles = useStyles();
  const { reduced, nativeDriver, duration } = useMotion();
  const [size, setSize] = useState<Measure>();
  const flight = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const done = useRef(false);
  const onStuckRef = useRef(onStuck);
  onStuckRef.current = onStuck;
  const playing = animate && !reduced;

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    onStuckRef.current?.();
  }, []);

  useEffect(() => {
    if (!playing) {
      flight.setValue(1);
      fade.setValue(0);
      finish();
      return undefined;
    }
    if (size === undefined) return undefined;
    const animation = Animated.sequence([
      Animated.spring(flight, { toValue: 1, ...springs.stick, useNativeDriver: nativeDriver }),
      Animated.timing(fade, { toValue: 0, duration: duration('fast'), useNativeDriver: nativeDriver }),
    ]);
    animation.start(() => finish());
    return () => animation.stop();
  }, [playing, size, flight, fade, nativeDriver, duration, finish]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0 && (size?.width !== width || size.height !== height)) setSize({ width, height });
  };

  const pageWidth = size?.width ?? 0;
  const pageHeight = size?.height ?? 0;
  const windowHeight = Math.min(WINDOW_HEIGHT, pageHeight > 0 ? pageHeight : WINDOW_HEIGHT);
  // The compact page is a header (livery stripe and progress) above a 3-column grid of slots, so the
  // grid starts where the page height minus the grid height leaves off.
  const slotCount = page.id === 'wildcards' ? page.wildcards.length : page.slots.length;
  const gridHeight =
    slotCount > 0 && pageWidth > 0
      ? slotRect(slotCount - 1, pageWidth, MINI_PAGE_COLUMNS).y + slotRect(0, pageWidth, MINI_PAGE_COLUMNS).height
      : 0;
  const gridTop = Math.max(0, pageHeight - gridHeight);
  const slot = slotIndex !== undefined && pageWidth > 0 ? slotRect(slotIndex, pageWidth, MINI_PAGE_COLUMNS) : undefined;
  const rect =
    slot !== undefined
      ? { ...slot, y: gridTop + slot.y }
      : { x: pageWidth / 4, y: windowHeight / 4, width: pageWidth / 2, height: windowHeight / 2 };
  const maxOffset = Math.max(0, pageHeight - windowHeight);
  const offset = Math.min(Math.max(rect.y + rect.height / 2 - windowHeight / 2, 0), maxOffset);
  const target = { x: rect.x, y: rect.y - offset };
  const startDx = pageWidth / 2 - (target.x + rect.width / 2);
  const startDy = windowHeight / 2 - (target.y + rect.height / 2);

  const flightStyle = {
    left: target.x,
    top: target.y,
    width: rect.width,
    height: rect.height,
    opacity: fade,
    transform: [
      { translateX: flight.interpolate({ inputRange: [0, 1], outputRange: [startDx, 0] }) },
      { translateY: flight.interpolate({ inputRange: [0, 1], outputRange: [startDy, 0] }) },
      {
        scale: flight.interpolate({
          inputRange: [0, 1],
          outputRange: [START_SCALE, slotIndex === undefined ? 0.6 : 1],
        }),
      },
      { rotate: flight.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '0deg'] }) },
    ],
  };

  return (
    <View style={[styles.window, { height: windowHeight }]} testID={testID}>
      <View style={[styles.page, { transform: [{ translateY: -offset }] }]} onLayout={onLayout}>
        <AlbumPage page={page} highlightModelId={highlightModelId} compact />
      </View>
      {playing && size !== undefined && (
        <Animated.View
          style={[styles.flight, flightStyle]}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {sticker}
        </Animated.View>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, radii, spacing }) => ({
  window: {
    overflow: 'hidden',
    borderRadius: radii.lg,
    backgroundColor: colors.background,
    padding: spacing.none,
  },
  page: { width: '100%' },
  flight: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
}));
