import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, View } from 'react-native';
import { createThemedStyles, springs, useMotion, useTheme } from '../../theme';
import type { LevelTitleKey } from '../../types/Progress';
import { KerbStripe } from '../primitives/KerbStripe';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { LevelRoundel } from '../progress/LevelRoundel';

export interface LevelUpBannerProps {
  /** The level just reached. */
  level: number;
  /** Title of that level (shown as "New title: …" when it changed). */
  titleKey: LevelTitleKey;
  /** The title before the level-up: when it differs, the new title is announced. */
  previousTitleKey?: LevelTitleKey;
  testID?: string;
}

/**
 * SHIFT UP! A pit board between two kerb stripes that springs in on a level-up (SPEC P0-15 step 5),
 * with the new level's roundel and, when it changed, the new title. Announced to screen readers.
 */
export function LevelUpBanner({ level, titleKey, previousTitleKey, testID }: LevelUpBannerProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { instruments } = useTheme();
  const { reduced, nativeDriver } = useMotion();
  const pop = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  const title = t(`reveal.titles.${titleKey}`);
  const newTitle = previousTitleKey !== undefined && previousTitleKey !== titleKey;

  useEffect(() => {
    if (reduced) {
      pop.setValue(1);
      return undefined;
    }
    const animation = Animated.spring(pop, { toValue: 1, ...springs.stamp, useNativeDriver: nativeDriver });
    animation.start();
    return () => animation.stop();
  }, [reduced, nativeDriver, pop]);

  const popStyle = {
    opacity: pop.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
    transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
  };

  return (
    <Animated.View
      style={[styles.banner, popStyle]}
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('reveal.shift_up_label', { level, title })}
      testID={testID}
    >
      <KerbStripe height={8} />
      <View style={styles.body}>
        <Row gap="md" justify="center">
          <LevelRoundel level={level} size="md" />
          <Stack gap="xxs" flex={1}>
            <Text variant="hero" color={instruments.pitBoardAccent}>
              {t('reveal.shift_up')}
            </Text>
            <Text variant="bodyStrong" color={instruments.pitBoardText}>
              {newTitle ? t('reveal.new_title', { title }) : t('reveal.level_line', { level, title })}
            </Text>
          </Stack>
        </Row>
      </View>
      <View style={styles.bottomStripe}>
        <KerbStripe height={8} />
      </View>
    </Animated.View>
  );
}

const useStyles = createThemedStyles(({ instruments, radii, spacing, elevation }) => ({
  banner: {
    backgroundColor: instruments.pitBoard,
    borderRadius: radii.md,
    overflow: 'hidden',
    gap: spacing.md,
    ...elevation.floating,
  },
  bottomStripe: { marginTop: spacing.xxs },
  body: { paddingHorizontal: spacing.md },
}));
