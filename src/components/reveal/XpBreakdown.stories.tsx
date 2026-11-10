import type { Meta, StoryObj } from '@storybook/react';
import { revealFixture } from './revealFixtures';
import { XpBreakdown } from './XpBreakdown';

const reveal = revealFixture({ kind: 'new', rewards: true, setComplete: true });
const duplicate = revealFixture({ kind: 'duplicate' });

const meta: Meta<typeof XpBreakdown> = {
  title: 'Reveal/XpBreakdown',
  component: XpBreakdown,
  args: { entries: reveal.entries, total: reveal.xpGained, animate: true },
};
export default meta;
type Story = StoryObj<typeof XpBreakdown>;

export const NewStickerWithRewards: Story = {};
export const Duplicate: Story = { args: { entries: duplicate.entries, total: duplicate.xpGained } };
export const Static: Story = { args: { animate: false } };
