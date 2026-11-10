import type { Meta, StoryObj } from '@storybook/react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../primitives/Text';
import { chiron, ferrari296, golf, porsche, SAMPLE_PHOTO_URL, sampleSpot } from './albumFixtures';
import { FoilSticker, type FoilStickerSize } from './FoilSticker';

const meta: Meta<typeof FoilSticker> = { title: 'Album/FoilSticker', component: FoilSticker };
export default meta;
type Story = StoryObj<typeof FoilSticker>;

const FINISHES = [golf, porsche, ferrari296, chiron];
const SIZES: FoilStickerSize[] = ['sm', 'md', 'lg', 'hero'];

export const Rare: Story = {
  args: { model: porsche, photoUrl: SAMPLE_PHOTO_URL, size: 'md', pageId: 'sports', tiltSeed: porsche.id },
};

export const WithCountStamp: Story = {
  args: { ...Rare.args, stamp: 'count', count: 3 },
};

export const Wildcard: Story = {
  args: {
    spot: sampleSpot({ id: 'wild', make: 'Fiat', model: 'Multipla', bodyStyle: 'van' }),
    size: 'md',
    stamp: 'wildcard',
    pageId: 'wildcards',
    tiltSeed: 'wild',
  },
};

export const NoPhoto: Story = {
  args: { model: ferrari296, size: 'md', pageId: 'supercar', tiltSeed: ferrari296.id, stamp: 'new' },
};

export const HeroLegendary: Story = {
  args: { model: chiron, photoUrl: SAMPLE_PHOTO_URL, size: 'hero', pageId: 'hypercar', tiltSeed: chiron.id },
};

/** The foil gallery: 4 finishes (matte, chrome, holo, gold) in every size; the decorator adds light and dark. */
export const FoilGallery: Story = {
  render: () => (
    <View style={styles.gallery}>
      {SIZES.map((size) => (
        <View key={size} style={styles.row}>
          <Text variant="label">{size}</Text>
          <View style={styles.stickers}>
            {FINISHES.map((model) => (
              <View key={model.id} style={styles[size]}>
                <FoilSticker
                  model={model}
                  photoUrl={SAMPLE_PHOTO_URL}
                  size={size}
                  pageId={model.category}
                  tiltSeed={model.id}
                  sheen="none"
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({
  gallery: { gap: 24 },
  row: { gap: 8 },
  stickers: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' },
  sm: { width: 110 },
  md: { width: 170 },
  lg: { width: 230 },
  hero: { width: 300 },
});
