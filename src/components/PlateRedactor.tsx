import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, PanResponder, View, type LayoutChangeEvent } from 'react-native';
import { createThemedStyles, radii } from '../theme';
import type { PickedPhoto, PlateRegion } from '../types/Spot';
import { regionFromDrag, type Point, type Size } from '../utils/redactionMath';

interface PlateRedactorProps {
  photo: PickedPhoto;
  regions: PlateRegion[];
  onAddRegion: (region: PlateRegion) => void;
  testID?: string;
}

interface Drag {
  start: Point;
  end: Point;
}

/**
 * Position of a box in percent of the photo. Photo coordinates are physical (x runs from the left
 * edge of the image), so this uses left on purpose instead of start: the frame is pinned to LTR,
 * so a right-to-left language never mirrors a box away from the plate it covers.
 */
function toBoxStyle(region: PlateRegion) {
  return {
    left: `${region.x * 100}%`,
    top: `${region.y * 100}%`,
    width: `${region.width * 100}%`,
    height: `${region.height * 100}%`,
  } as const; // const assertion keeps the `${number}%` template types that RN expects
}

/**
 * Shows the photo and lets the user drag a rectangle over every licence plate.
 * Works with touch (Android, mobile web) and mouse (desktop browser) through the PanResponder.
 * Marked areas are shown as boxes here; the real pixelation happens in utils/imageRedaction.
 */
export function PlateRedactor({ photo, regions, onAddRegion, testID }: PlateRedactorProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [drag, setDrag] = useState<Drag>();

  // Refs keep the PanResponder (created once) in sync with the latest props and layout.
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const onAddRegionRef = useRef(onAddRegion);
  onAddRegionRef.current = onAddRegion;
  const startRef = useRef<Point>();

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          const start = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
          startRef.current = start;
          setDrag({ start, end: start });
        },
        onPanResponderMove: (_event, gesture) => {
          const start = startRef.current;
          if (start === undefined) return;
          setDrag({ start, end: { x: start.x + gesture.dx, y: start.y + gesture.dy } });
        },
        onPanResponderRelease: (_event, gesture) => {
          const start = startRef.current;
          if (start !== undefined) {
            const region = regionFromDrag(start, { x: start.x + gesture.dx, y: start.y + gesture.dy }, sizeRef.current);
            if (region !== undefined) onAddRegionRef.current(region);
          }
          startRef.current = undefined;
          setDrag(undefined);
        },
        onPanResponderTerminate: () => {
          startRef.current = undefined;
          setDrag(undefined);
        },
      }),
    [],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  const draftRegion = drag !== undefined ? regionFromDrag(drag.start, drag.end, size) : undefined;
  const aspectRatio = photo.width > 0 && photo.height > 0 ? photo.width / photo.height : 4 / 3;

  return (
    <View
      style={[styles.frame, { aspectRatio }]}
      onLayout={onLayout}
      accessibilityLabel={t('redactor.accessibility_label')}
      testID={testID}
      {...panResponder.panHandlers}
    >
      {/* RN Image on purpose: a local, not yet redacted photo is no candidate for expo-image's cache. */}
      <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="cover" />
      {regions.map((region, index) => (
        <View
          key={`${region.x}-${region.y}-${index}`}
          pointerEvents="none"
          style={[styles.box, toBoxStyle(region)]}
          testID="redaction-box"
        />
      ))}
      {draftRegion !== undefined && (
        <View pointerEvents="none" style={[styles.box, styles.draft, toBoxStyle(draftRegion)]} />
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  frame: {
    width: '100%',
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.photoBackdrop,
    // Photo coordinates are never mirrored, also not in right-to-left languages (see toBoxStyle).
    direction: 'ltr',
    // Web only: stop the page from scrolling while drawing a box with a finger.
    touchAction: 'none',
    userSelect: 'none',
  },
  image: { width: '100%', height: '100%' },
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.redactionBox,
    borderRadius: 4,
  },
  draft: { borderStyle: 'dashed' },
}));
