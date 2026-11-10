import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, useTheme } from '../../theme';
import type { CollectionId } from '../../types/Collection';
import type { AlbumPageId } from '../../types/Progress';
import { pageStamp } from '../../utils/album';
import { ProgressBar } from '../primitives/ProgressBar';
import { Surface } from '../primitives/Surface';
import { Text } from '../primitives/Text';
import { liveryOf, visibleLiveryColor } from './LiveryStripe';
import { SetCompleteStamp } from './SetCompleteStamp';
import { StampBadge } from './StampBadge';

export type PageIndexCardVariant = 'grid' | 'shelf';

export interface PageIndexCardProps {
  /** Already translated page or set title. */
  title: string;
  /** Page number (01–09) or set number (1–8). */
  number: number;
  collected: number;
  total: number;
  /** Category or Wildcards page; or `collectionId` for a themed set. */
  pageId?: AlbumPageId;
  collectionId?: CollectionId;
  /** Collected flag per slot in sticker order: one pip per slot. */
  slots?: readonly boolean[];
  /** Wildcards page: the number of wildcard spots (it has no slots). */
  wildcardCount?: number;
  /** Shown on shelf cards (a set's tagline). */
  description?: string;
  /** Default `grid` (album contents); `shelf` is the wider collection card. */
  variant?: PageIndexCardVariant;
  onPress: () => void;
  testID?: string;
}

/**
 * An entry of the album contents: the page or set in its livery, its progress ("5/6"), one pip per
 * slot, and a ONE TO GO, FULL PAGE or SET COMPLETE stamp.
 */
export function PageIndexCard({
  title,
  number,
  collected,
  total,
  pageId,
  collectionId,
  slots = [],
  wildcardCount,
  description,
  variant = 'grid',
  onPress,
  testID,
}: PageIndexCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useStyles();
  const livery = liveryOf(theme, pageId, collectionId);
  const isSet = collectionId !== undefined;
  const isWildcards = pageId === 'wildcards';
  const stamp = isWildcards ? undefined : pageStamp({ collected, total });
  const accessibilityLabel = t(isSet ? 'album.set_card_label' : 'album.page_card_label', {
    number,
    title,
    collected,
    total,
  });
  const id = testID ?? (isSet ? `collection-card-${collectionId}` : `page-card-${pageId ?? 'wildcards'}`);

  return (
    <Surface variant="raised" radius="lg" onPress={onPress} accessibilityLabel={accessibilityLabel} testID={id}>
      <View style={[styles.card, variant === 'shelf' && styles.shelf]}>
        <View style={[styles.band, { backgroundColor: livery.base }]}>
          <Text variant="stickerNo" color={livery.text}>
            {isSet ? t('album.set_number', { number }) : String(number).padStart(2, '0')}
          </Text>
          <View style={[styles.bandStripe, { backgroundColor: livery.stripe }]} />
        </View>
        <View style={styles.body}>
          <Text variant="headline" numberOfLines={2}>
            {title}
          </Text>
          {description !== undefined && (
            <Text variant="caption" tone="muted" numberOfLines={2}>
              {description}
            </Text>
          )}
          {isWildcards ? (
            <Text variant="numberSm" testID={`${id}-count`}>
              {t('album.wildcards_count', { count: wildcardCount ?? 0 })}
            </Text>
          ) : (
            <>
              <Text variant="numberSm" testID={`${id}-count`}>
                {t('album.progress_count', { collected, total })}
              </Text>
              <ProgressBar
                progress={total === 0 ? 0 : collected / total}
                label={accessibilityLabel}
                tone="livery"
                liveryColor={visibleLiveryColor(livery, theme.colors.surfaceSunken)}
                height={6}
              />
              {slots.length > 0 && (
                <View style={styles.pips} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  {slots.map((isCollected, index) => (
                    <View
                      key={index}
                      style={[styles.pip, isCollected ? { backgroundColor: theme.colors.text } : styles.pipEmpty]}
                    />
                  ))}
                </View>
              )}
            </>
          )}
          <View style={styles.stampRow}>
            {stamp === 'full_page' && isSet && collectionId !== undefined ? (
              <SetCompleteStamp collectionId={collectionId} size="sm" />
            ) : (
              stamp !== undefined && <StampBadge kind={stamp} size="sm" />
            )}
          </View>
        </View>
      </View>
    </Surface>
  );
}

const useStyles = createThemedStyles(({ colors, spacing }) => ({
  card: { minHeight: 150 },
  shelf: { width: 220 },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.smd,
    minHeight: 28,
    overflow: 'hidden',
  },
  bandStripe: { width: 28, alignSelf: 'stretch', transform: [{ skewX: '-20deg' }], marginRight: -6 },
  body: { padding: spacing.smd, gap: spacing.xs, flex: 1 },
  pips: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  pip: { width: 6, height: 6, borderRadius: 3 },
  pipEmpty: { borderWidth: 1, borderColor: colors.borderStrong },
  stampRow: { minHeight: 22, alignItems: 'flex-start', justifyContent: 'flex-end' },
}));
