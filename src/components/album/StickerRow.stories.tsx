import type { Meta, StoryObj } from '@storybook/react';
import { StickerRow } from './StickerRow';
import { chiron, porsche, sampleSpot } from './albumFixtures';

const meta: Meta<typeof StickerRow> = { title: 'Album/StickerRow', component: StickerRow };
export default meta;
type Story = StoryObj<typeof StickerRow>;

export const Collected: Story = {
  args: {
    model: porsche,
    isCollected: true,
    cover: sampleSpot({ id: 'row-1', carModelId: porsche.id }),
    spotCount: 3,
    onPress: () => undefined,
  },
};
export const Missing: Story = { args: { model: chiron, isCollected: false, spotCount: 0, onPress: () => undefined } };
