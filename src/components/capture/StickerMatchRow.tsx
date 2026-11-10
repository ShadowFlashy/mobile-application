import { useTranslation } from 'react-i18next';
import type { CarModel } from '../../types/CarModel';
import type { Provenance } from '../../types/Identification';
import { Icon } from '../primitives/Icon';
import { Row } from '../primitives/Row';
import { Stack } from '../primitives/Stack';
import { Surface } from '../primitives/Surface';
import { Tag } from '../primitives/Tag';
import { Text } from '../primitives/Text';
import { RarityBadge } from '../RarityBadge';
import { ProvenanceTag } from './ProvenanceTag';

export interface StickerMatchRowProps {
  /** The catalogue sticker this spot fills, if any. */
  model?: CarModel;
  /** A named car outside the album: it becomes a wildcard. */
  isWildcard: boolean;
  provenance?: Provenance;
  testID?: string;
}

/** Which album sticker this spot will fill: "#07 · Porsche 911 GT3" with its rarity, or a wildcard. */
export function StickerMatchRow({ model, isWildcard, provenance, testID = 'sticker-match' }: StickerMatchRowProps) {
  const { t } = useTranslation();
  return (
    <Surface variant="sunken" padding="smd" testID={testID}>
      <Row gap="smd" align="center">
        <Icon name={model !== undefined ? 'albums' : 'shuffle'} tone={model !== undefined ? 'accent' : 'muted'} />
        <Stack gap="xxs" flex={1}>
          <Text variant="caption" tone="muted">
            {t('capture.sticker_label')}
          </Text>
          {model !== undefined ? (
            <Row gap="xs" align="center" wrap>
              <Text variant="stickerNo" testID={`${testID}-number`}>
                {t('capture.sticker_number', { number: String(model.stickerNumber).padStart(2, '0') })}
              </Text>
              <Text variant="bodyStrong">
                {model.make} {model.model}
              </Text>
              <RarityBadge rarity={model.rarity} />
            </Row>
          ) : isWildcard ? (
            <Stack gap="xxs">
              <Tag label={t('capture.wildcard')} icon="shuffle" testID={`${testID}-wildcard`} />
              <Text variant="caption" tone="muted">
                {t('capture.wildcard_hint')}
              </Text>
            </Stack>
          ) : (
            <Text variant="bodySm" tone="muted">
              {t('capture.no_sticker_yet')}
            </Text>
          )}
        </Stack>
        {provenance !== undefined && model !== undefined && <ProvenanceTag provenance={provenance} />}
      </Row>
    </Surface>
  );
}
