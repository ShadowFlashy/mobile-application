import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { borders, createThemedStyles, elevation, useTheme } from '../../theme';
import type { CollectionId } from '../../types/Collection';
import { Gradient } from '../primitives/Gradient';
import { Text } from '../primitives/Text';

export type SetCompleteStampSize = 'sm' | 'lg';

export interface SetCompleteStampProps {
  collectionId: CollectionId;
  /** Default `lg` (the collection page); `sm` fits on a set card. */
  size?: SetCompleteStampSize;
}

/**
 * The SET COMPLETE reward (Appendix E): a gold-foil rimmed stamp in the set's livery, pressed at an
 * angle onto a completed collection.
 */
export function SetCompleteStamp({ collectionId, size = 'lg' }: SetCompleteStampProps) {
  const { t } = useTranslation();
  const { collectionLiveries, finishes } = useTheme();
  const styles = useStyles();
  const livery = collectionLiveries[collectionId];
  const setName = t(`collections.${collectionId}.title`);
  return (
    <View
      style={[styles.frame, size === 'sm' ? styles.frameSmall : styles.frameLarge]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('stamps.set_complete_label', { set: setName })}
      testID="stamp-set-complete"
    >
      <Gradient colors={finishes.legendary.edge} direction="diagonal" fill />
      <View
        style={[
          styles.inner,
          size === 'sm' ? styles.innerSmall : styles.innerLarge,
          { backgroundColor: livery.base, borderColor: livery.stripe },
        ]}
      >
        <Text variant={size === 'sm' ? 'label' : 'title'} color={livery.text} align="center" numberOfLines={1}>
          {t('stamps.set_complete')}
        </Text>
        {size === 'lg' && (
          <Text variant="caption" color={livery.text} align="center" numberOfLines={1}>
            {setName}
          </Text>
        )}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ spacing, radii }) => ({
  frame: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: radii.md,
    transform: [{ rotate: '-8deg' }],
    ...elevation.sticker,
  },
  frameSmall: { padding: borders.strong },
  frameLarge: { padding: borders.stickerEdge + 1 },
  inner: { borderRadius: radii.sm, borderWidth: borders.strong, borderStyle: 'dashed', alignItems: 'center' },
  innerSmall: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  innerLarge: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.xxs },
}));
