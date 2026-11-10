import type { Meta, StoryObj } from '@storybook/react';
import { chiron, ferrari308, porsche, sampleSpot } from './albumFixtures';
import { StickerHero } from './StickerHero';

const meta: Meta<typeof StickerHero> = { title: 'Album/StickerHero', component: StickerHero };
export default meta;
type Story = StoryObj<typeof StickerHero>;

export const Collected: Story = {
  args: {
    model: porsche,
    isCollected: true,
    cover: sampleSpot({ id: 'hero-1', carModelId: porsche.id }),
    spotCount: 3,
  },
};
export const CollectedWithAutoFill: Story = {
  args: {
    model: ferrari308,
    isCollected: true,
    cover: sampleSpot({ id: 'hero-308', carModelId: ferrari308.id, make: 'Ferrari', model: '308 GTSi' }),
    spotCount: 1,
  },
};
export const Locked: Story = { args: { model: porsche, isCollected: false, spotCount: 0 } };
export const LockedChase: Story = { args: { model: chiron, isCollected: false, spotCount: 0 } };
