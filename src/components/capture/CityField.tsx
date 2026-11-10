import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Provenance } from '../../types/Identification';
import type { Place } from '../../types/Location';
import { Icon } from '../primitives/Icon';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Text } from '../primitives/Text';
import { CityPicker } from './CityPicker';
import { ProvenanceTag } from './ProvenanceTag';

export interface CityFieldProps {
  value: string;
  onChange: (city: string) => void;
  /** AUTO when the gazetteer filled it in, YOU once edited. */
  provenance?: Provenance;
  places?: readonly Place[];
  testID?: string;
}

/** The city of the spot (a label only, never a position); tapping it opens the CityPicker. */
export function CityField({ value, onChange, provenance, places, testID = 'city-field' }: CityFieldProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Surface
        variant="flat"
        padding="smd"
        onPress={() => setIsOpen(true)}
        accessibilityLabel={`${t('capture.city_label')}: ${value.length > 0 ? value : t('capture.city_placeholder')}`}
        testID={testID}
      >
        <Row gap="smd" align="center">
          <Icon name="location" tone="muted" />
          <Stack gap="xxs" flex={1}>
            <Text variant="caption" tone="muted">
              {t('capture.city_label')}
            </Text>
            <Text
              variant={value.length > 0 ? 'bodyStrong' : 'body'}
              tone={value.length > 0 ? 'default' : 'subtle'}
              testID={`${testID}-value`}
            >
              {value.length > 0 ? value : t('capture.city_placeholder')}
            </Text>
          </Stack>
          {provenance !== undefined && <ProvenanceTag provenance={provenance} />}
          <Icon name="chevron-forward" tone="subtle" size={18} />
        </Row>
      </Surface>
      <CityPicker visible={isOpen} onClose={() => setIsOpen(false)} value={value} onSelect={onChange} places={places} />
    </>
  );
}
