import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, spacing, touchTarget } from '../../theme';
import { Icon, type IconName } from '../primitives/Icon';
import { Sheet } from '../primitives/Sheet';
import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { StyledButton } from '../StyledButton';

export interface AiConsentSheetProps {
  visible: boolean;
  onAccept: () => void;
  /** "Fill in myself": switches auto-fill off; closing the sheet counts as this too. */
  onDecline: () => void;
  testID?: string;
}

const POINTS: { key: 'consent_point_blur' | 'consent_point_limit' | 'consent_point_switch'; icon: IconName }[] = [
  { key: 'consent_point_blur', icon: 'eye-off' },
  { key: 'consent_point_limit', icon: 'clock' },
  { key: 'consent_point_switch', icon: 'power' },
];

/**
 * First-use consent for auto-fill (SPEC P0-18, §6.1 d), as a plain A sheet: what is sent where, three
 * hairline rows, then "Use auto-fill" and the way out, "Fill in myself".
 */
export function AiConsentSheet({ visible, onAccept, onDecline, testID = 'ai-consent-sheet' }: AiConsentSheetProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <Sheet visible={visible} onClose={onDecline} title={t('co_driver.consent_title')} testID={testID}>
      <Stack gap="lg">
        <Text variant="value">{t('co_driver.consent_body')}</Text>
        <View style={styles.list}>
          {POINTS.map((point) => (
            <View key={point.key} style={styles.point}>
              <Icon name={point.icon} size={20} tone="text2" />
              <View style={styles.flex}>
                <Text variant="body">{t(`co_driver.${point.key}`)}</Text>
              </View>
            </View>
          ))}
        </View>
        <Stack gap="sm">
          <StyledButton label={t('co_driver.consent_accept')} onPress={onAccept} testID="consent-accept" />
          <StyledButton
            label={t('co_driver.consent_decline')}
            variant="secondary"
            onPress={onDecline}
            testID="consent-decline"
          />
        </Stack>
      </Stack>
    </Sheet>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  list: { borderTopWidth: lines.hairline, borderTopColor: colors.line },
  point: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.sm,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  flex: { flex: 1, minWidth: 0 },
}));
