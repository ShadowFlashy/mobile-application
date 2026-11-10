import type { Meta, StoryObj } from '@storybook/react';
import { StickerPacket } from './StickerPacket';

const meta: Meta<typeof StickerPacket> = {
  title: 'Reveal/StickerPacket',
  component: StickerPacket,
  args: { onOpen: () => undefined, torn: false, season: 1 },
};
export default meta;
type Story = StoryObj<typeof StickerPacket>;

export const Sealed: Story = {};
export const Torn: Story = { args: { torn: true } };
