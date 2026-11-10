import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { createThemedStyles, lines, spacing, touchTarget } from '../../theme';
import type { CaptureForm } from '../../types/Capture';
import type { Provenance } from '../../types/Identification';
import { maskPlate } from '../../utils/captureForm';
import { normalizePlate } from '../../utils/plate';
import { InputField } from '../primitives/InputField';
import { Section } from '../primitives/Section';
import { Switch } from '../primitives/Switch';
import { Text } from '../primitives/Text';
import { StyledButton } from '../StyledButton';

type OwnerPingFields = Pick<CaptureForm, 'plate' | 'notifyOwner' | 'shareNameWithOwner'>;

export interface OwnerPingRowProps {
  value: OwnerPingFields;
  onChange: (patch: Partial<OwnerPingFields>) => void;
  /** Auto-fill when the plate was read by the AI, You once typed. */
  provenance?: Provenance;
  testID?: string;
}

/**
 * "Ping the owner if registered" (SPEC D-4, P0-02). The plate is shown masked (••34) and lives in
 * memory only; it is sent once as `plate_input`, and only with the toggle on. Typing a plate turns
 * the ping on; the user can always switch it off. Sharing the spotter's name is a separate opt-in.
 */
export function OwnerPingRow({ value, onChange, provenance, testID = 'owner-ping' }: OwnerPingRowProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [isEditing, setIsEditing] = useState(false);
  const masked = maskPlate(value.plate);
  const showInput = isEditing || masked.length === 0;
  const plateEntered = normalizePlate(value.plate).length > 0;

  const changePlate = (plate: string) => {
    // Keep the field open while typing: the masked view is only for a plate auto-fill read.
    setIsEditing(true);
    const hadPlate = normalizePlate(value.plate).length > 0;
    const hasPlate = normalizePlate(plate).length > 0;
    onChange({ plate, notifyOwner: hasPlate ? value.notifyOwner || !hadPlate : false });
  };

  return (
    <Section
      title={t('capture.owner_label')}
      meta={provenance !== undefined ? t(`capture.provenance_${provenance}`) : undefined}
      testID={testID}
    >
      {showInput ? (
        <View style={styles.input}>
          <InputField
            label={t('capture.plate_label')}
            value={value.plate}
            onChangeText={changePlate}
            placeholder={t('capture.plate_placeholder')}
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={20}
            testID="plate-input"
          />
        </View>
      ) : (
        <View style={styles.plateRow}>
          <View style={styles.flex}>
            <Text variant="body" testID="masked-plate">
              {t('capture.plate_masked', { plate: masked })}
            </Text>
          </View>
          <StyledButton
            label={t('capture.plate_edit')}
            variant="text"
            onPress={() => setIsEditing(true)}
            testID="edit-plate"
          />
        </View>
      )}
      <Switch
        label={t('capture.ping_label')}
        // Disabled says why: without a plate there is no owner to notify.
        description={plateEntered ? t('capture.ping_sub') : t('capture.ping_needs_plate')}
        value={value.notifyOwner}
        onChange={(notifyOwner) => onChange({ notifyOwner })}
        disabled={!plateEntered}
        divider={value.notifyOwner}
        testID="ping-toggle"
      />
      {value.notifyOwner && (
        <Switch
          label={t('capture.share_name_label')}
          description={t('capture.share_name_description')}
          value={value.shareNameWithOwner}
          onChange={(shareNameWithOwner) => onChange({ shareNameWithOwner })}
          testID="share-name-toggle"
        />
      )}
      <View style={styles.help}>
        <Text variant="meta" tone="text2">
          {t('capture.ping_description')}
        </Text>
      </View>
    </Section>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  input: { paddingTop: spacing.smd, paddingBottom: spacing.sm },
  plateRow: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  flex: { flex: 1, minWidth: 0 },
  help: { paddingTop: spacing.sm },
}));
