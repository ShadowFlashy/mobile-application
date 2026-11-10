import type { Meta, StoryObj } from '@storybook/react';
import { FoilSticker } from '../album/FoilSticker';
import { MiniPageStick } from './MiniPageStick';
import { FERRARI_308, pageFixture, revealFixture } from './revealFixtures';

const reveal = revealFixture();

const meta: Meta<typeof MiniPageStick> = {
  title: 'Reveal/MiniPageStick',
  component: MiniPageStick,
  args: {
    page: pageFixture(reveal),
    highlightModelId: FERRARI_308.id,
    slotIndex: 2,
    animate: true,
    sticker: (
      <FoilSticker model={FERRARI_308} spot={reveal.spot} size="sm" pageId="classic" tiltSeed={reveal.spot.id} />
    ),
  },
};
export default meta;
type Story = StoryObj<typeof MiniPageStick>;

export const Sticking: Story = {};
export const Stuck: Story = { args: { animate: false } };
export const Wildcards: Story = {
  args: { page: pageFixture(revealFixture({ kind: 'wildcard' })), highlightModelId: undefined, slotIndex: undefined },
};
