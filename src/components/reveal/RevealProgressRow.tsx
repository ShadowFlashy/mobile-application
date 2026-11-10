import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, View } from 'react-native';
import { contrastRatio, createThemedStyles, springs, useMotion, useTheme, type Livery } from '../../theme';
import type { CollectionId } from '../../types/Collection';
import type { AlbumPageId } from '../../types/Progress';
import { SetCompleteStamp } from '../album/SetCompleteStamp';
import { StampBadge } from '../album/StampBadge';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';

export type RevealProgressTarget = { kind: 'page'; pageId: AlbumPageId } | { kind: 'set'; collectionId: CollectionId };

export interface RevealProgressRowProps {
  target: RevealProgressTarget;
  /** Stickers collected (for the Wildcards page: wildcard spots). */
  collected: number;
  /** Slots on the page or cars in the set (0 for Wildcards). */
  total: number;
  /** This spot completed the page (FULL PAGE) or the set (SET COMPLETE). */
  justCompleted?: boolean;
  testID?: string;
}

/** The livery colour that stands out most on the stage backdrop (base or stripe). */
function visibleOn(livery: Livery, background: string): string {
  const base = contrastRatio(livery.base, background) ?? 0;
  const stripe = contrastRatio(livery.stripe, background) ?? 0;
  return base >= stripe ? livery.base : livery.stripe;
}

/** A stamp slammed down with the stamp spring (FULL PAGE / SET COMPLETE). */
function Slam({ children, testID }: { children: ReactNode; testID?: string }) {
  const { reduced, nativeDriver } = useMotion();
  const slam = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      slam.setValue(1);
      return undefined;
    }
    const animation = Animated.spring(slam, { toValue: 1, ...springs.stamp, useNativeDriver: nativeDriver });
    animation.start();
    return () => animation.stop();
  }, [reduced, nativeDriver, slam]);

  const slamStyle = {
    opacity: slam.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
    transform: [{ scale: slam.interpolate({ inputRange: [0, 1], outputRange: [2.2, 1] }) }],
  };

  return (
    <Animated.View style={slamStyle} testID={testID}>
      {children}
    </Animated.View>
  );
}

/** A progress bar for the always-dark stage (the shared ProgressBar's track is made for paper). */
function StageBar({ progress, label, color }: { progress: number; label: string; color: string }) {
  const styles = useStyles();
  const percentage = Math.round(Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0)) * 100);
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
    >
      <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );
}

/**
 * One progress line of the reveal (SPEC P0-15 step 6 and Appendix E): "SUPERCARS 4/6" for the
 * album page or "ITALIAN EXOTICS 3/10" for a themed set, with a bar in the page or set livery and a
 * FULL PAGE or SET COMPLETE stamp when this spot completed it. The Wildcards page has no slots, so
 * it reads "WILDCARDS ×3".
 */
export function RevealProgressRow({ target, collected, total, justCompleted = false, testID }: RevealProgressRowProps) {
  const { t } = useTranslation();
  const { colors, liveries, collectionLiveries } = useTheme();

  const livery = target.kind === 'page' ? liveries[target.pageId] : collectionLiveries[target.collectionId];
  const title =
    target.kind === 'set'
      ? t(`collections.${target.collectionId}.title`)
      : target.pageId === 'wildcards'
        ? t('reveal.wildcards')
        : t(`categories.${target.pageId}`);

  if (target.kind === 'page' && target.pageId === 'wildcards') {
    return (
      <Row gap="sm" testID={testID}>
        <Text variant="label" tone="onStage">
          {t('reveal.wildcards_count', { times: collected })}
        </Text>
      </Row>
    );
  }

  return (
    <Stack gap="xs" testID={testID}>
      <Row justify="space-between" gap="sm">
        <Text variant="label" tone="onStage" numberOfLines={1}>
          {t('reveal.progress', { title, collected, total })}
        </Text>
        {justCompleted && (
          <Slam testID={testID !== undefined ? `${testID}-complete` : undefined}>
            {target.kind === 'page' ? (
              <StampBadge kind="full_page" />
            ) : (
              <SetCompleteStamp collectionId={target.collectionId} size="sm" />
            )}
          </Slam>
        )}
      </Row>
      <StageBar
        progress={total > 0 ? collected / total : 0}
        label={t('reveal.progress_label', { title, collected, total })}
        color={visibleOn(livery, colors.stage)}
      />
    </Stack>
  );
}

const useStyles = createThemedStyles(({ instruments, radii, colors }) => ({
  track: {
    height: 8,
    borderRadius: radii.pill,
    overflow: 'hidden',
    backgroundColor: instruments.pitBoard,
    borderWidth: 1,
    borderColor: colors.onStageMuted,
  },
  fill: { height: '100%', borderRadius: radii.pill },
}));
