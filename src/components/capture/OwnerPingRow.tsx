import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CaptureForm } from '../../types/Capture';
import type { Provenance } from '../../types/Identification';
import { maskPlate } from '../../utils/captureForm';
import { normalizePlate } from '../../utils/plate';
import { InputField } from '../primitives/InputField';
import { Row } from '../primitives/Row';
import { Section } from '../primitives/Section';
import { Stack } from '../primitives/Stack';
import { Switch } from '../primitives/Switch';
import { Tag } from '../primitives/Tag';
import { Text } from '../primitives/Text';
import { ProvenanceTag } from './ProvenanceTag';

type OwnerPingFields = Pick<CaptureForm, 'plate' | 'notifyOwner' | 'shareNameWithOwner'>;

export interface OwnerPingRowProps {
  value: OwnerPingFields;
  onChange: (patch: Partial<OwnerPingFields>) => void;
  /** CO-DRIVER when the plate was read by the AI, YOU once typed. */
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
  const [isEditing, setIsEditing] = useState(false);
  const masked = maskPlate(value.plate);
  const showInput = isEditing || masked.length === 0;

  const changePlate = (plate: string) => {
    // Keep the field open while typing: the masked view is only for a plate Co-Driver read.
    setIsEditing(true);
    const hadPlate = normalizePlate(value.plate).length > 0;
    const hasPlate = normalizePlate(plate).length > 0;
    onChange({ plate, notifyOwner: hasPlate ? value.notifyOwner || !hadPlate : false });
  };

  return (
    <Section
      title={t('capture.owner_label')}
      action={provenance !== undefined ? <ProvenanceTag provenance={provenance} /> : undefined}
      testID={testID}
    >
      <Stack gap="sm">
        {showInput ? (
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
        ) : (
          <Row gap="sm" align="center" wrap>
            <Text variant="bodyStrong" testID="masked-plate">
              {t('capture.plate_masked', { plate: masked })}
            </Text>
            <Tag
              label={t('capture.plate_edit')}
              icon="create-outline"
              onPress={() => setIsEditing(true)}
              testID="edit-plate"
            />
          </Row>
        )}
        <Switch
          label={t('capture.ping_label')}
          description={t('capture.ping_description')}
          value={value.notifyOwner}
          onChange={(notifyOwner) => onChange({ notifyOwner })}
          disabled={normalizePlate(value.plate).length === 0}
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
      </Stack>
    </Section>
  );
}
