import { useContext, useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { createThemedStyles, easings, spacing, useMotion } from '../../theme';
import { IconButton } from './IconButton';
import { Text } from './Text';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  /** Already translated. */
  title: string;
  children: ReactNode;
  testID?: string;
}

const SLIDE_DISTANCE = 480;

/** A bottom sheet in a Modal: slides up, or crossfades when motion is reduced. */
export function Sheet({ visible, onClose, title, children, testID }: SheetProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { reduced, duration, nativeDriver } = useMotion();
  const insets = useContext(SafeAreaInsetsContext);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      progress.setValue(0);
      return;
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: duration('slow'),
      easing: easings.decelerate,
      useNativeDriver: nativeDriver,
    }).start();
  }, [visible, progress, duration, nativeDriver]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [SLIDE_DISTANCE, 0] });
  const sheetMotion = reduced ? { opacity: progress } : { transform: [{ translateY }] };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
          <Pressable
            style={styles.backdrop}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            testID={testID !== undefined ? `${testID}-backdrop` : undefined}
          />
        </Animated.View>
        <Animated.View
          style={[styles.sheet, { paddingBottom: spacing.lg + (insets?.bottom ?? 0) }, sheetMotion]}
          accessibilityViewIsModal
          testID={testID}
        >
          <View style={styles.grabber} />
          <View style={styles.header}>
            <View style={styles.title}>
              <Text variant="title" heading>
                {title}
              </Text>
            </View>
            <IconButton
              icon="close"
              label={t('ui.close_sheet', { title })}
              onPress={onClose}
              testID={testID !== undefined ? `${testID}-close` : undefined}
            />
          </View>
          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const useStyles = createThemedStyles(({ colors, elevation, radii }) => ({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '88%',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    ...elevation.floating,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  title: { flex: 1 },
  body: { flexGrow: 0 },
}));
