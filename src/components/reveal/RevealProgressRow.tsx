import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { columns, createThemedStyles, lines, rowHeights, spacing } from '../../theme';
import type { CollectionId } from '../../types/Collection';
import type { AlbumPageId } from '../../types/Progress';
import { Icon } from '../primitives/Icon';
import { ProgressBar } from '../primitives/ProgressBar';
import { Text } from '../primitives/Text';

export type RevealProgressTarget = { kind: 'page'; pageId: AlbumPageId } | { kind: 'set'; collectionId: CollectionId };

export interface RevealProgressRowProps {
  target: RevealProgressTarget;
  /** Stickers collected (for the Wildcards page: wildcard spots). */
  collected: number;
  /** Slots on the page or cars in the set (0 for Wildcards). */
  total: number;
  /** The album page number ("05"), shown in front of a page's name. */
  number?: number;
  /** This spot completed the page or the set: a check and "Complete" (`<testID>-complete`). */
  justCompleted?: boolean;
  /** The bottom hairline. Default true. */
  divider?: boolean;
  testID?: string;
}

/**
 * One progress row of the reveal, like a row of the album's page table: "05  Classics  ——  3/4" for
 * the page, "Italian Exotics  ——  3/12" for a set and "Wildcards  ×2" for the Wildcards page. A
 * just-completed page or set says "Complete" with a check instead of the line.
 */
export function RevealProgressRow({
  target,
  collected,
  total,
  number,
  justCompleted = false,
  divider = true,
  testID,
}: RevealProgressRowProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const isWildcards = target.kind === 'page' && target.pageId === 'wildcards';
  let title: string;
  if (target.kind === 'set') title = t(`collections.${target.collectionId}.title`);
  else if (target.pageId === 'wildcards') title = t('reveal.wildcards');
  else title = t(`categories.${target.pageId}`);
  const label = isWildcards
    ? t('reveal.wildcards_label', { times: collected })
    : t('reveal.progress_label', { title, collected, total });

  return (
    <View
      style={[styles.row, divider && styles.divider]}
      accessible
      accessibilityLabel={justCompleted ? `${label}. ${t('reveal.complete')}` : label}
      testID={testID}
    >
      {!isWildcards && (
        <View style={styles.number}>
          {target.kind === 'page' && number !== undefined && (
            <Text variant="numS" tone="text2">
              {String(number).padStart(2, '0')}
            </Text>
          )}
        </View>
      )}
      <View style={styles.title}>
        {/* Two lines: a long set name ("German Autobahn Heroes") wraps instead of truncating. */}
        <Text variant="body" numberOfLines={2}>
          {title}
        </Text>
      </View>
      {justCompleted ? (
        <View style={styles.complete} testID={testID !== undefined ? `${testID}-complete` : undefined}>
          <Icon name="check" size={16} />
          <Text variant="meta">{t('reveal.complete')}</Text>
        </View>
      ) : (
        !isWildcards && <ProgressBar progress={total > 0 ? collected / total : 0} label={label} width={columns.bar} />
      )}
      <View style={styles.count}>
        <Text variant="num" align="right">
          {isWildcards ? t('reveal.times', { times: collected }) : t('reveal.count', { collected, total })}
        </Text>
      </View>
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
  },
  divider: { borderBottomWidth: lines.hairline, borderBottomColor: colors.line },
  number: { minWidth: columns.page },
  title: { flex: 1, minWidth: 0 },
  complete: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  count: { minWidth: columns.count, alignItems: 'flex-end' },
}));
