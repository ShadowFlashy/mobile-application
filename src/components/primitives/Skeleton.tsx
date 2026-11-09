import { useEffect, useRef } from 'react';
import { Animated, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createThemedStyles } from '../../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  testID?: string;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 4, testID }: SkeletonProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // The native driver is not available on web.
    const useNativeDriver = Platform.OS !== 'web';
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.base, { width, height, borderRadius, opacity }]}
      accessibilityLabel={t('a11y.loading')}
      testID={testID}
    />
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  base: { backgroundColor: colors.border },
}));
