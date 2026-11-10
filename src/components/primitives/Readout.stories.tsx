import type { Meta, StoryObj } from '@storybook/react';
import { Readout } from './Readout';
import { Row } from './Row';

const meta: Meta<typeof Readout> = { title: 'Primitives/Readout', component: Readout };
export default meta;
type Story = StoryObj<typeof Readout>;

export const AlbumTotal: Story = {
  args: {
    value: '10',
    of: '118',
    meta: 'Stickers · 8% of Season 1',
    progress: 10 / 118,
    progressLabel: 'Season 1',
    size: 'hero',
  },
};
export const Level: Story = {
  args: { unit: 'LVL', value: '8', meta: '585 XP to level 9', progress: 0.27, progressLabel: 'Level 8' },
};
export const Compact: Story = { args: { value: '2,140', suffix: 'XP', meta: 'This season', size: 'compact' } };

/** The Album header pair from the mockup: the season total next to the level. */
export const Pair: Story = {
  render: () => (
    <Row gap="lg" align="flex-end">
      <Readout
        value="10"
        of="118"
        meta="Stickers · 8% of Season 1"
        progress={0.085}
        progressLabel="Season 1"
        size="hero"
      />
      <Readout unit="LVL" value="8" meta="585 XP to level 9" progress={0.27} progressLabel="Level 8" />
    </Row>
  ),
};
