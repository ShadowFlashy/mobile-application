import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import type { Provenance } from '../../types/Identification';
import { Tag, type TagTone } from '../primitives/Tag';
import type { IconName } from '../primitives/Icon';

export interface ProvenanceTagProps {
  provenance: Provenance;
}

const TONES: Record<Provenance, TagTone> = { ai: 'accent', auto: 'auto', user: 'default' };
const ICONS: Record<Provenance, IconName> = { ai: 'sparkles', auto: 'locate', user: 'person' };

/**
 * Where a pre-filled value came from (SPEC P0-05): CO-DRIVER (the AI), AUTO (EXIF or the gazetteer)
 * or YOU (edited). A text label plus an icon, so it never relies on colour alone.
 */
export function ProvenanceTag({ provenance }: ProvenanceTagProps) {
  const { t } = useTranslation();
  const label = t(`capture.provenance_${provenance}`);
  return (
    <View accessible accessibilityLabel={t('capture.provenance_label', { source: label })}>
      <Tag
        label={label.toUpperCase()}
        tone={TONES[provenance]}
        icon={ICONS[provenance]}
        testID={`provenance-${provenance}`}
      />
    </View>
  );
}
