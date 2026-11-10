import { View, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { borders, createThemedStyles, radii, useTheme } from '../../theme';
import { Text } from './Text';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

/** A round photo or, without one, the initials on a roundel decal. */
export function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { instruments } = useTheme();
  const initials = name
    ? name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';
  const label = name !== undefined ? t('a11y.avatar_of', { name }) : t('a11y.avatar');

  if (uri !== undefined) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, styles[size]]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={label}
      />
    );
  }

  return (
    <View
      style={[styles.base, styles[size], styles.fallback]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      <Text variant={size === 'lg' ? 'display' : 'numberSm'} color={instruments.roundelInk}>
        {initials}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ instruments }) => ({
  base: { borderRadius: radii.pill, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  fallback: {
    backgroundColor: instruments.roundel,
    borderWidth: borders.stickerEdge,
    borderColor: instruments.roundelInk,
  },
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 72, height: 72 },
}));
