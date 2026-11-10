import { useTranslation } from 'react-i18next';
import type { Provenance } from '../../types/Identification';
import { Text } from '../primitives/Text';

export interface ProvenanceTagProps {
  provenance: Provenance;
}

/**
 * Where a pre-filled value came from (SPEC P0-05), as a plain meta line in text-2 (never a chip):
 * "Auto-fill" (the AI), "From photo" (EXIF or the gazetteer) or "You" (edited).
 */
export function ProvenanceTag({ provenance }: ProvenanceTagProps) {
  const { t } = useTranslation();
  const label = t(`capture.provenance_${provenance}`);
  return (
    <Text
      variant="meta"
      tone="text2"
      numberOfLines={1}
      accessibilityLabel={t('capture.provenance_label', { source: label })}
      testID={`provenance-${provenance}`}
    >
      {label}
    </Text>
  );
}
