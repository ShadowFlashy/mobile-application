import { useContext, useEffect, useId, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { createThemedStyles, easings, lines, spacing, useMotion } from '../../theme';
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

/**
 * A bottom sheet in a Modal: a flat `raise` panel (radius 8 on top, a hairline edge) with A's title
 * row and a close button. Slides up, or crossfades when motion is reduced.
 */
export function Sheet({ visible, onClose, title, children, testID }: SheetProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const { reduced, duration, nativeDriver } = useMotion();
  const insets = useContext(SafeAreaInsetsContext);
  const progress = useRef(new Animated.Value(0)).current;
  const titleId = useId();

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
          {/* Pointer-only: kept out of the focus order and the accessibility tree, so focus starts in
              the sheet. The close button is the accessible way out. */}
          <Pressable
            style={styles.backdrop}
            onPress={onClose}
            accessible={false}
            focusable={false}
            aria-hidden
            testID={testID !== undefined ? `${testID}-backdrop` : undefined}
          />
        </Animated.View>
        <Animated.View
          style={[styles.sheet, { paddingBottom: spacing.lg + (insets?.bottom ?? 0) }, sheetMotion]}
          accessibilityViewIsModal
          aria-modal
          aria-labelledby={titleId}
          testID={testID}
        >
          <View style={styles.header}>
            <View style={styles.title}>
              <Text variant="title" heading level={2} nativeID={titleId}>
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

const useStyles = createThemedStyles(({ colors, radii }) => ({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '88%',
    alignSelf: 'center',
    backgroundColor: colors.raise,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    borderTopWidth: lines.hairline,
    borderColor: colors.line,
    paddingStart: spacing.gutter,
    paddingEnd: spacing.sm,
    paddingTop: spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  title: { flex: 1 },
  body: { flexGrow: 0, paddingEnd: spacing.smd },
}));
