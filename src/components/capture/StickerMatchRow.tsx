import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ALBUM_PAGES } from '../../constants/albumPages';
import { createThemedStyles, lines, rowHeights, spacing } from '../../theme';
import type { CarModel } from '../../types/CarModel';
import type { RevealKind } from '../../types/Progress';
import { isCollectionId } from '../../utils/album';
import { RarityRoundel } from '../primitives/RarityRoundel';
import { Text } from '../primitives/Text';

export interface StickerMatchRowProps {
  /** The catalogue sticker this spot fills, if any. */
  model?: CarModel;
  /** A named car outside the album: it becomes a wildcard. */
  isWildcard: boolean;
  /** What saving adds (from the preview): a new sticker, a new paint or a repeat. */
  kind?: RevealKind;
  /** Spots of this model including this one (for a repeat). */
  count?: number;
  /** Collections the model belongs to. */
  setIds?: readonly string[];
  testID?: string;
}

/**
 * Which album sticker this spot fills, as A's sticker row: "#31 New sticker" over
 * "06 JDM · Japanese JDM Legends", with the tier and its roundel on the right; or a wildcard.
 */
export function StickerMatchRow({
  model,
  isWildcard,
  kind,
  count = 1,
  setIds = [],
  testID = 'sticker-match',
}: StickerMatchRowProps) {
  const { t } = useTranslation();
  const styles = useStyles();

  if (model === undefined) {
    return (
      <View style={[styles.row, isWildcard && styles.tall]} testID={testID}>
        <View style={styles.text}>
          {isWildcard ? (
            <>
              <Text variant="body" testID={`${testID}-wildcard`}>
                {t('capture.wildcard')}
              </Text>
              <Text variant="meta" tone="text2">
                {t('capture.wildcard_hint')}
              </Text>
            </>
          ) : (
            <Text variant="value" tone="text2">
              {t('capture.no_sticker_yet')}
            </Text>
          )}
        </View>
      </View>
    );
  }

  const page = ALBUM_PAGES.find((candidate) => candidate.category === model.category);
  const pageLabel =
    page !== undefined
      ? t('capture.sticker_page', {
          number: String(page.number).padStart(2, '0'),
          page: t(`categories.${model.category}`),
        })
      : undefined;
  const sets = setIds.filter(isCollectionId).map((id) => t(`collections.${id}.title`));
  const subtitle = [pageLabel, ...sets].filter((part): part is string => part !== undefined).join(' · ');
  const status =
    kind === 'new'
      ? t('capture.sticker_new')
      : kind === 'fresh_paint'
        ? t('capture.sticker_new_paint')
        : kind === 'duplicate'
          ? t('capture.sticker_again', { count })
          : `${model.make} ${model.model}`;

  return (
    <View style={[styles.row, styles.tall]} testID={testID}>
      <View style={styles.text}>
        <View style={styles.title}>
          <Text variant="num" testID={`${testID}-number`}>
            <Text variant="num" tone="text2">
              {t('capture.sticker_hash')}
            </Text>
            {String(model.stickerNumber).padStart(2, '0')}
          </Text>
          <Text variant="body" numberOfLines={1}>
            {status}
          </Text>
        </View>
        {subtitle.length > 0 && (
          <Text variant="meta" tone="text2" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      <RarityRoundel rarity={model.rarity} showLabel testID={`${testID}-rarity`} />
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    minHeight: rowHeights.default,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.xs,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  tall: { minHeight: rowHeights.tall },
  text: { flex: 1, minWidth: 0 },
  title: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
}));
