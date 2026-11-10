import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, PanResponder, Pressable, View, type LayoutChangeEvent } from 'react-native';
import { createThemedStyles, lines, radii, spacing, touchTarget } from '../../theme';
import type { PickedPhoto, PlateRegion } from '../../types/Spot';
import {
  defaultRegion,
  moveRegion,
  regionFromDrag,
  resizeRegion,
  toNormalisedDelta,
  type Point,
  type Size,
} from '../../utils/redactionMath';
import { IconButton } from '../primitives/IconButton';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { StyledButton } from '../StyledButton';

export interface PlateEditorProps {
  photo: PickedPhoto;
  /** The redacted preview (same redactPhoto as the upload, ≤960 px). Until it exists the photo shows. */
  previewUri?: string;
  regions: PlateRegion[];
  /** Auto-fill's padded plate boxes: dashed until accepted, never blurred on their own. */
  suggestions: PlateRegion[];
  acceptedSuggestions: number[];
  onAddRegion: (region: PlateRegion) => void;
  onUpdateRegion: (index: number, region: PlateRegion) => void;
  onRemoveRegion: (index: number) => void;
  onAcceptSuggestion: (index: number) => void;
  /** Rendered over the top-left corner of the photo (e.g. the PlateShield). */
  overlay?: ReactNode;
  disabled?: boolean;
  testID?: string;
}

/** A drag shorter than this (px) is a tap. */
const TAP_SLOP = 4;
const FALLBACK_ASPECT_RATIO = 4 / 3;

/**
 * Position of a box in percent of the photo. Photo coordinates are physical, so this uses `left`
 * on purpose (not `start`): the frame is pinned to LTR, so a right-to-left language never mirrors a
 * box away from the plate it covers.
 */
function toBoxStyle(region: PlateRegion) {
  return {
    left: `${region.x * 100}%`,
    top: `${region.y * 100}%`,
    width: `${region.width * 100}%`,
    height: `${region.height * 100}%`,
  } as const; // const assertion keeps the `${number}%` template types that RN expects
}

interface RegionBoxProps {
  region: PlateRegion;
  index: number;
  size: Size;
  disabled: boolean;
  onChange: (index: number, region: PlateRegion) => void;
}

/** One blur box: drag it to move, drag its corner handle to resize. Changes commit on release. */
function RegionBox({ region, index, size, disabled, onChange }: RegionBoxProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [live, setLive] = useState<PlateRegion>();
  const latest = useRef({ region, size, disabled, onChange, index });
  latest.current = { region, size, disabled, onChange, index };

  const responders = useMemo(() => {
    const create = (transform: (start: PlateRegion, delta: Point) => PlateRegion) => {
      let start: PlateRegion | undefined;
      let current: PlateRegion | undefined;
      return PanResponder.create({
        onStartShouldSetPanResponder: () => !latest.current.disabled,
        onMoveShouldSetPanResponder: () => !latest.current.disabled,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          start = latest.current.region;
          current = start;
        },
        onPanResponderMove: (_event, gesture) => {
          if (start === undefined) return;
          current = transform(start, toNormalisedDelta(gesture.dx, gesture.dy, latest.current.size));
          setLive(current);
        },
        onPanResponderRelease: (_event, gesture) => {
          const moved = Math.abs(gesture.dx) > TAP_SLOP || Math.abs(gesture.dy) > TAP_SLOP;
          if (moved && current !== undefined) latest.current.onChange(latest.current.index, current);
          start = undefined;
          current = undefined;
          setLive(undefined);
        },
        onPanResponderTerminate: () => {
          start = undefined;
          current = undefined;
          setLive(undefined);
        },
      });
    };
    return {
      move: create((start, delta) => moveRegion(start, delta.x, delta.y)),
      resize: create((start, delta) => resizeRegion(start, delta.x, delta.y)),
    };
  }, []);

  const shown = live ?? region;
  return (
    <View
      style={[styles.region, toBoxStyle(shown)]}
      accessibilityLabel={t('redactor.region_label', { number: index + 1 })}
      testID={`plate-region-${index}`}
      {...responders.move.panHandlers}
    >
      {/* Two-tone outline: a light line with a dark line inside reads on white cars and on night shots. */}
      <View pointerEvents="none" style={styles.innerRing} />
      <View
        style={styles.handle}
        accessibilityLabel={t('redactor.resize_handle', { number: index + 1 })}
        testID={`plate-region-${index}-handle`}
        {...responders.resize.panHandlers}
      >
        <View style={styles.handleMark} />
      </View>
    </View>
  );
}

/**
 * The plate step (SPEC P0-04, D-5): the redacted preview with every blur box on top.
 * - Auto-fill's plate boxes are dashed suggestions (`plate-suggestion-<n>`): a tap turns one into a
 *   real region, which can then be dragged and resized like any other box.
 * - Drag over the photo to draw a box, or use the accessible "Add box" button. Each box has a chip
 *   with a remove action.
 * - The frame gets `data-measured="true"` once its size is known (tests wait for it).
 */
export function PlateEditor({
  photo,
  previewUri,
  regions,
  suggestions,
  acceptedSuggestions,
  onAddRegion,
  onUpdateRegion,
  onRemoveRegion,
  onAcceptSuggestion,
  overlay,
  disabled = false,
  testID = 'plate-editor',
}: PlateEditorProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [drag, setDrag] = useState<{ start: Point; end: Point }>();

  const latest = useRef({ size, onAddRegion, disabled });
  latest.current = { size, onAddRegion, disabled };
  const startRef = useRef<Point>();

  const drawResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !latest.current.disabled,
        onMoveShouldSetPanResponder: () => !latest.current.disabled,
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
            const end = { x: start.x + gesture.dx, y: start.y + gesture.dy };
            const region = regionFromDrag(start, end, latest.current.size);
            if (region !== undefined) latest.current.onAddRegion(region);
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

  const isMeasured = size.width > 0 && size.height > 0;
  // react-native-web renders `dataSet` as data-* attributes; native ignores it.
  const webData = { dataSet: { measured: isMeasured ? 'true' : 'false' } };
  const draftRegion = drag !== undefined ? regionFromDrag(drag.start, drag.end, size) : undefined;
  const aspectRatio = photo.width > 0 && photo.height > 0 ? photo.width / photo.height : FALLBACK_ASPECT_RATIO;

  return (
    <Stack gap="sm">
      <View
        style={[styles.frame, { aspectRatio }]}
        onLayout={onLayout}
        accessibilityLabel={t('redactor.accessibility_label')}
        testID={testID}
        {...webData}
        {...drawResponder.panHandlers}
      >
        {/* RN Image on purpose: a local photo or data: preview is no candidate for expo-image's cache. */}
        <Image
          source={{ uri: previewUri ?? photo.uri }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={previewUri !== undefined ? t('redactor.preview_label') : undefined}
          testID={previewUri !== undefined ? `${testID}-preview` : `${testID}-photo`}
        />
        {suggestions.map((suggestion, index) =>
          acceptedSuggestions.includes(index) ? null : (
            <Pressable
              key={`suggestion-${index}`}
              style={[styles.suggestion, toBoxStyle(suggestion)]}
              onPress={() => onAcceptSuggestion(index)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={t('redactor.suggestion_label', { number: index + 1 })}
              hitSlop={spacing.smd}
              testID={`plate-suggestion-${index}`}
            >
              <View pointerEvents="none" style={styles.innerRing} />
              {/* A 44 × 44 target centred on a small box (clicks on it bubble to the Pressable on the web). */}
              <View style={styles.suggestionHit} />
            </Pressable>
          ),
        )}
        {regions.map((region, index) => (
          <RegionBox
            key={`region-${index}`}
            region={region}
            index={index}
            size={size}
            disabled={disabled}
            onChange={onUpdateRegion}
          />
        ))}
        {draftRegion !== undefined && (
          <View pointerEvents="none" style={[styles.draft, toBoxStyle(draftRegion)]}>
            <View style={styles.innerRing} />
          </View>
        )}
        {overlay !== undefined && (
          <View pointerEvents="none" style={styles.overlay}>
            {overlay}
          </View>
        )}
      </View>
      <Row gap="md" wrap align="center" testID={`${testID}-chips`}>
        {regions.map((_region, index) => (
          <View key={`chip-${index}`} style={styles.regionItem} testID={`plate-region-chip-${index}`}>
            <Text variant="body">{t('redactor.region_chip', { number: index + 1 })}</Text>
            {!disabled && (
              <IconButton
                icon="close"
                label={t('redactor.remove_box', { number: index + 1 })}
                onPress={() => onRemoveRegion(index)}
                testID={`remove-plate-region-${index}`}
              />
            )}
          </View>
        ))}
        <StyledButton
          label={t('redactor.add_box')}
          variant="text"
          icon="plus"
          disabled={disabled}
          onPress={() => {
            if (!disabled) onAddRegion(defaultRegion(regions.length));
          }}
          testID="add-box-button"
        />
      </Row>
    </Stack>
  );
}

/** The resize handle's hit area is a full touch target, centred on the box corner. */
const HANDLE_HIT = touchTarget;
const HANDLE_MARK = 10;

const useStyles = createThemedStyles(({ colors }) => ({
  frame: {
    width: '100%',
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.raise,
    // Photo coordinates are never mirrored, also not in right-to-left languages (see toBoxStyle).
    direction: 'ltr',
    // Web only: stop the page from scrolling while drawing a box with a finger.
    touchAction: 'none',
    userSelect: 'none',
  },
  image: { width: '100%', height: '100%' },
  // A's plate boxes: a light stage line with a dark stage line inside it (the photo does not follow
  // the scheme, so the box must not either), on a 12 % fill, square corners (radius 2), no glow.
  region: {
    position: 'absolute',
    borderWidth: lines.ring,
    borderColor: colors.onStage,
    backgroundColor: colors.plateFill,
    borderRadius: radii.xs,
  },
  handle: {
    position: 'absolute',
    right: -HANDLE_HIT / 2,
    bottom: -HANDLE_HIT / 2,
    width: HANDLE_HIT,
    height: HANDLE_HIT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleMark: {
    width: HANDLE_MARK,
    height: HANDLE_MARK,
    borderRadius: radii.xs,
    borderWidth: lines.hairline,
    borderColor: colors.stage,
    backgroundColor: colors.onStage,
  },
  innerRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: lines.hairline,
    borderColor: colors.stage,
  },
  suggestion: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: lines.ring,
    borderStyle: 'dashed',
    borderColor: colors.onStage,
    backgroundColor: colors.plateFill,
    borderRadius: radii.xs,
  },
  suggestionHit: { width: touchTarget, height: touchTarget, minWidth: '100%', minHeight: '100%' },
  draft: {
    position: 'absolute',
    borderWidth: lines.ring,
    borderStyle: 'dashed',
    borderColor: colors.onStage,
    backgroundColor: colors.plateFill,
    borderRadius: radii.xs,
  },
  overlay: { position: 'absolute', top: spacing.sm, left: spacing.sm, right: spacing.sm },
  regionItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
}));
