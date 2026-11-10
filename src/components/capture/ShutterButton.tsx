import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { borders, createThemedStyles, elevation, spacing, useTheme } from '../../theme';
import { Gradient } from '../primitives/Gradient';
import { Icon } from '../primitives/Icon';
import { PressableScale } from '../primitives/PressableScale';
import { Spinner } from '../primitives/Spinner';
import { Text } from '../primitives/Text';

export interface ShutterButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  testID?: string;
}

const SIZE = 96;

/** The big camera shutter of the Spot launcher: a red gradient disc in a chrome ring, 96 dp. */
export function ShutterButton({
  onPress,
  disabled = false,
  isLoading = false,
  testID = 'shutter-button',
}: ShutterButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <PressableScale
        onPress={onPress}
        disabled={disabled || isLoading}
        scaleTo={0.94}
        haptic="tap"
        accessibilityLabel={t('spot.shutter_label')}
        accessibilityHint={t('spot.shutter_hint')}
        busy={isLoading}
        testID={testID}
      >
        <View style={styles.ring}>
          <View style={styles.disc}>
            <Gradient colors={[colors.primary, colors.primaryPressed]} direction="diagonal" fill />
            {isLoading ? <Spinner tone="onPrimary" /> : <Icon name="camera" size={40} tone="onPrimary" />}
          </View>
        </View>
      </PressableScale>
      <Text variant="label" tone="muted">
        {t('spot.shutter_label')}
      </Text>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  root: { alignItems: 'center', gap: spacing.sm },
  ring: {
    width: SIZE + 16,
    height: SIZE + 16,
    borderRadius: (SIZE + 16) / 2,
    borderWidth: borders.stickerEdge,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.raised,
  },
  disc: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
