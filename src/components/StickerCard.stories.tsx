import type { Meta, StoryObj } from '@storybook/react';
import { StyleSheet, View } from 'react-native';
import type { CarModel } from '../types/CarModel';
import { StickerCard } from './StickerCard';

/**
 * Stand-in photo: an inline SVG car silhouette as a data URI, so the stories need no network and
 * no signed URL. It is drawn with opacity only, it has no colours of its own.
 */
const SAMPLE_PHOTO_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">',
    '<rect width="160" height="120" fill-opacity="0.12"/>',
    '<path d="M14 84 L26 66 Q32 58 46 56 L62 44 Q70 38 84 38 L104 38 Q118 38 126 50 L134 60 Q148 62 150 74 L150 84 Z" fill-opacity="0.55"/>',
    '<circle cx="46" cy="86" r="12" fill-opacity="0.85"/>',
    '<circle cx="120" cy="86" r="12" fill-opacity="0.85"/>',
    '</svg>',
  ].join(''),
)}`;

const porsche: CarModel = {
  id: 'model-porsche-911-gt3-rs',
  stickerNumber: 7,
  make: 'Porsche',
  model: '911 GT3 RS',
  category: 'sports',
  rarity: 'rare',
};

const bugatti: CarModel = {
  id: 'model-bugatti-chiron',
  stickerNumber: 31,
  make: 'Bugatti',
  model: 'Chiron Super Sport',
  category: 'hypercar',
  rarity: 'legendary',
};

const styles = StyleSheet.create({
  // About the width of one cell of the two-column sticker grid on a phone.
  cell: { width: 170 },
});

const meta: Meta<typeof StickerCard> = {
  title: 'Components/StickerCard',
  component: StickerCard,
  decorators: [
    (Story) => (
      <View style={styles.cell}>
        <Story />
      </View>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof StickerCard>;

export const CollectedWithPhoto: Story = {
  args: {
    model: porsche,
    isCollected: true,
    spotCount: 3,
    photoUrl: SAMPLE_PHOTO_URL,
    photoPath: 'user-1/spot-porsche-911.jpg',
    onPress: () => {},
  },
};

/** Collected, but the signed photo URL is not available (yet): a photo placeholder is shown. */
export const CollectedWithoutPhoto: Story = {
  args: { model: porsche, isCollected: true, spotCount: 1, onPress: () => {} },
};

export const Locked: Story = {
  args: { model: bugatti, isCollected: false, spotCount: 0, onPress: () => {} },
};
