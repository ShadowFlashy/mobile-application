import { useTranslation } from 'react-i18next';
import { PAINT_COLORS, type PaintColor } from '../../types/CarModel';
import type { Provenance } from '../../types/Identification';
import { PressableScale } from '../primitives/PressableScale';
import { Row } from '../primitives/Row';
import { Section } from '../primitives/Section';
import { Skeleton } from '../primitives/Skeleton';
import { PaintSwatch } from './PaintSwatch';
import { ProvenanceTag } from './ProvenanceTag';

export interface PaintPickerProps {
  value: PaintColor;
  onChange: (paint: PaintColor) => void;
  provenance?: Provenance;
  /** Co-Driver may still fill the paint in: shows a shimmer instead of the swatches' selection. */
  isAnalysing?: boolean;
  testID?: string;
}

/** The 14 paints as tappable swatches (each with its name); the chosen one is ringed. */
export function PaintPicker({
  value,
  onChange,
  provenance,
  isAnalysing = false,
  testID = 'paint-picker',
}: PaintPickerProps) {
  const { t } = useTranslation();
  return (
    <Section
      title={t('capture.paint_label')}
      action={provenance !== undefined ? <ProvenanceTag provenance={provenance} /> : undefined}
      testID={testID}
    >
      {isAnalysing && <Skeleton height={20} width="60%" testID={`${testID}-analysing`} />}
      <Row gap="xs" wrap>
        {PAINT_COLORS.map((paint) => (
          <PressableScale
            key={paint}
            onPress={() => onChange(paint)}
            accessibilityRole="radio"
            accessibilityLabel={t('capture.paint_choose', { paint: t(`paint.${paint}`) })}
            checked={paint === value}
            testID={`paint-option-${paint}`}
          >
            <PaintSwatch paint={paint} size="md" selected={paint === value} />
          </PressableScale>
        ))}
      </Row>
    </Section>
  );
}
