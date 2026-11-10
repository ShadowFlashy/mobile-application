import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { createThemedStyles, lines, spacing, touchTarget } from '../../theme';
import { PAINT_COLORS, type PaintColor } from '../../types/CarModel';
import type { Provenance } from '../../types/Identification';
import { Icon } from '../primitives/Icon';
import { spaceKey } from '../primitives/keyboard';
import { Sheet } from '../primitives/Sheet';
import { Spinner } from '../primitives/Spinner';
import { Text } from '../primitives/Text';
import { DetailRow } from './DetailRow';
import { PaintSwatch } from './PaintSwatch';

export interface PaintPickerProps {
  value: PaintColor;
  onChange: (paint: PaintColor) => void;
  provenance?: Provenance;
  /** Auto-fill may still fill the paint in: a spinner next to the value. */
  isAnalysing?: boolean;
  testID?: string;
}

interface PaintOptionProps {
  paint: PaintColor;
  selected: boolean;
  onSelect: (paint: PaintColor) => void;
}

/** One radio row of the paint sheet: the dot, the name and a check when chosen. */
function PaintOption({ paint, selected, onSelect }: PaintOptionProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <Pressable
      onPress={() => onSelect(paint)}
      {...spaceKey(() => onSelect(paint))}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      accessibilityLabel={t('capture.paint_choose', { paint: t(`paint.${paint}`) })}
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}
      testID={`paint-option-${paint}`}
    >
      <PaintSwatch paint={paint} size="md" dotOnly />
      <View style={styles.name}>
        <Text variant="body">{t(`paint.${paint}`)}</Text>
      </View>
      {selected && <Icon name="check" size={20} />}
    </Pressable>
  );
}

/** The paint row of the review; tapping it opens a sheet with the 14 paints as radio rows. */
export function PaintPicker({
  value,
  onChange,
  provenance,
  isAnalysing = false,
  testID = 'paint-picker',
}: PaintPickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const name = t(`paint.${value}`);
  return (
    <>
      <DetailRow
        label={t('capture.paint_label')}
        value={name}
        provenance={provenance}
        leading={
          isAnalysing ? (
            <Spinner size="small" testID={`${testID}-analysing`} />
          ) : (
            <PaintSwatch paint={value} size="sm" dotOnly />
          )
        }
        onPress={() => setIsOpen(true)}
        accessibilityLabel={`${t('capture.paint_label')}: ${name}`}
        testID={testID}
      />
      <Sheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('capture.paint_sheet_title')}
        testID="paint-sheet"
      >
        <View accessibilityRole="radiogroup" accessibilityLabel={t('capture.paint_label')}>
          {PAINT_COLORS.map((paint) => (
            <PaintOption
              key={paint}
              paint={paint}
              selected={paint === value}
              onSelect={(chosen) => {
                onChange(chosen);
                setIsOpen(false);
              }}
            />
          ))}
        </View>
      </Sheet>
    </>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  option: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.xs,
    borderBottomWidth: lines.hairline,
    borderBottomColor: colors.line,
  },
  pressed: { opacity: 0.7 },
  name: { flex: 1, minWidth: 0 },
}));
