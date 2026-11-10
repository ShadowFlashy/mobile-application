import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, spacing } from '../../theme';
import type { PlateConfirmation } from '../../types/Capture';
import { Icon } from '../primitives/Icon';
import { Radio } from '../primitives/Radio';
import { Section } from '../primitives/Section';
import { Text } from '../primitives/Text';
import { StyledButton } from '../StyledButton';

export interface PlateConfirmProps {
  /** Number of blur regions on the photo. */
  regionCount: number;
  /** The user's statement; undefined until they choose (it is reset on every region change). */
  confirmation?: PlateConfirmation;
  /** "No plate visible" was chosen while auto-fill suggested plates no box covers. */
  needsSecondTap: boolean;
  /** How many suggested plates are not covered. */
  ignoredCount: number;
  onConfirm: (confirmation: PlateConfirmation) => void;
  onConfirmIgnored: () => void;
  /** testID of the whole "Plates" section. */
  sectionTestID?: string;
  testID?: string;
}

/** The "Plates" meta: "Not checked", "1 plate blurred" or "No plate visible". */
function plateStatusKey(confirmation: PlateConfirmation | undefined) {
  if (confirmation === undefined) return 'redactor.shield_pending' as const;
  return confirmation === 'none_visible' ? ('redactor.shield_none' as const) : ('redactor.shield' as const);
}

/**
 * The explicit plate statement under the photo (SPEC D-5, P0-04), as A's "Plates" section: the
 * status as meta, then exactly two radio rows with nothing pre-selected: "Every plate is blurred"
 * (needs at least one box) or "No plate visible", which asks a second time when auto-fill thinks it
 * saw a plate.
 */
export function PlateConfirm({
  regionCount,
  confirmation,
  needsSecondTap,
  ignoredCount,
  onConfirm,
  onConfirmIgnored,
  sectionTestID,
  testID = 'plate-confirm',
}: PlateConfirmProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const status = t(plateStatusKey(confirmation), { count: regionCount });
  return (
    <Section title={t('capture.section_plates')} meta={status} testID={sectionTestID}>
      <View accessibilityRole="radiogroup" accessibilityLabel={t('capture.section_plates')} testID={testID}>
        <Radio
          label={t('redactor.confirm_blurred')}
          description={
            regionCount === 0 ? t('redactor.confirm_blurred_hint') : t('redactor.areas', { count: regionCount })
          }
          value="blurred"
          selected={confirmation === 'blurred'}
          disabled={regionCount === 0}
          onSelect={() => onConfirm('blurred')}
          testID={`${testID}-blurred`}
        />
        <Radio
          label={t('redactor.confirm_none')}
          value="none_visible"
          selected={confirmation === 'none_visible'}
          onSelect={() => onConfirm('none_visible')}
          testID={`${testID}-none`}
        />
        {needsSecondTap && (
          <View style={styles.warning} accessibilityRole="alert" testID={`${testID}-warning`}>
            <View style={styles.warningText}>
              <Icon name="warning" size={20} />
              <View style={styles.flex}>
                <Text variant="body">{t('redactor.warning_title')}</Text>
                <Text variant="meta" tone="text2">
                  {t('redactor.warning_body', { count: ignoredCount })}
                </Text>
              </View>
            </View>
            <StyledButton
              label={t('redactor.warning_confirm')}
              variant="secondary"
              onPress={onConfirmIgnored}
              testID={`${testID}-second-tap`}
            />
          </View>
        )}
      </View>
    </Section>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  warning: {
    gap: spacing.smd,
    paddingVertical: spacing.smd,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  warningText: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.smd },
  flex: { flex: 1, minWidth: 0 },
}));
