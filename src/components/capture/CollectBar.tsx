import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, spacing } from '../../theme';
import type { PlateGate } from '../../types/Capture';
import { Icon } from '../primitives/Icon';
import { Text } from '../primitives/Text';
import { StyledButton } from '../StyledButton';

export interface CollectBarProps {
  gate: PlateGate;
  onCollect: () => void;
  isSaving?: boolean;
  /** The last save failure, shown directly above the button (the draft is kept for a retry). */
  saveError?: string;
  /** What saving adds, shown on the left once the gate is open (e.g. "#31 · +125 XP"). */
  result?: string;
  testID?: string;
}

/**
 * The content of the review's compact sticky footer (SPEC P0-03): the reason on the left ("Check the
 * plates first", "Pick the car first", "Needs a connection to save") and "Add to album" on the
 * right, so a disabled button is never a mystery. Red only when the gate is open.
 */
export function CollectBar({
  gate,
  onCollect,
  isSaving = false,
  saveError,
  result,
  testID = 'collect-bar',
}: CollectBarProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const reason = gate.ok ? undefined : gate.reason;
  const showReason = reason !== undefined && reason !== 'busy';
  return (
    <View style={styles.root} testID={testID}>
      {saveError !== undefined && (
        <View style={styles.error} accessibilityRole="alert" testID="collect-error">
          <Icon name="alert" size={20} />
          <View style={styles.flex}>
            <Text variant="body">{t('capture.save_error_title')}</Text>
            <Text variant="meta" tone="text2">
              {saveError}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.bar}>
        <View style={styles.flex}>
          {showReason ? (
            <Text variant="body" tone="text2" numberOfLines={2} testID="collect-reason">
              {t(`capture.reason_${reason}`)}
            </Text>
          ) : (
            gate.ok &&
            result !== undefined && (
              <Text variant="num" numberOfLines={1} testID="collect-result">
                {result}
              </Text>
            )
          )}
        </View>
        <StyledButton
          label={t('capture.collect')}
          onPress={onCollect}
          disabled={!gate.ok}
          isLoading={isSaving}
          accessibilityHint={reason !== undefined ? t(`capture.reason_${reason}`) : t('capture.collect_hint')}
          testID="collect-button"
        />
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  root: { gap: spacing.smd },
  error: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  bar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, minWidth: 0 },
}));
