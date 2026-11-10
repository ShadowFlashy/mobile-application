import type { ReactNode } from 'react';
import { View } from 'react-native';
import { createThemedStyles, type SpacingToken } from '../../theme';
import { paddingStyles } from './layout';
import { PressableScale } from './PressableScale';

export type SurfaceVariant = 'flat' | 'raised' | 'sunken' | 'inverse' | 'stage';

interface SurfaceProps {
  children: ReactNode;
  /** Default `raised`. */
  variant?: SurfaceVariant;
  /** Default `md`. */
  radius?: 'md' | 'lg' | 'sticker';
  /** Default `none`. */
  padding?: SpacingToken;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

/** A card-like surface: background, hairline and elevation from tokens; pressable when onPress is set. */
export function Surface({
  children,
  variant = 'raised',
  radius = 'md',
  padding = 'none',
  onPress,
  accessibilityLabel,
  testID,
}: SurfaceProps) {
  const styles = useStyles();
  const body = (
    <View
      style={[styles.base, styles[variant], styles[radius], paddingStyles[padding]]}
      testID={onPress === undefined ? testID : undefined}
    >
      {children}
    </View>
  );
  if (onPress === undefined) return body;
  return (
    <PressableScale onPress={onPress} accessibilityLabel={accessibilityLabel} testID={testID}>
      {body}
    </PressableScale>
  );
}

const useStyles = createThemedStyles(({ colors, elevation, radii }) => ({
  base: { overflow: 'hidden' },
  flat: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  raised: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...elevation.raised },
  sunken: { backgroundColor: colors.surfaceSunken },
  inverse: { backgroundColor: colors.inverseSurface },
  stage: { backgroundColor: colors.stage },
  md: { borderRadius: radii.md },
  lg: { borderRadius: radii.lg },
  sticker: { borderRadius: radii.sticker },
}));
