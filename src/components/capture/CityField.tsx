import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Provenance } from '../../types/Identification';
import type { Place } from '../../types/Location';
import { CityPicker } from './CityPicker';
import { DetailRow } from './DetailRow';

export interface CityFieldProps {
  value: string;
  onChange: (city: string) => void;
  /** AUTO when the gazetteer filled it in, YOU once edited. */
  provenance?: Provenance;
  places?: readonly Place[];
  testID?: string;
}

/** The city row of the review (a label only, never a position); tapping it opens the CityPicker. */
export function CityField({ value, onChange, provenance, places, testID = 'city-field' }: CityFieldProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <DetailRow
        label={t('capture.city_label')}
        value={value}
        placeholder={t('capture.city_placeholder')}
        provenance={provenance}
        onPress={() => setIsOpen(true)}
        accessibilityLabel={`${t('capture.city_label')}: ${value.length > 0 ? value : t('capture.city_placeholder')}`}
        testID={testID}
      />
      <CityPicker visible={isOpen} onClose={() => setIsOpen(false)} value={value} onSelect={onChange} places={places} />
    </>
  );
}
