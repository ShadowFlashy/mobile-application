import type { Meta, StoryObj } from '@storybook/react';
import { AlbumTotals } from './AlbumTotals';
import { SAMPLE_LEVEL } from './albumFixtures';

const meta: Meta<typeof AlbumTotals> = { title: 'Album/AlbumTotals', component: AlbumTotals };
export default meta;
type Story = StoryObj<typeof AlbumTotals>;

/** The mockup: 10/118 · 8% of Season 1, LVL 8 · 585 XP to level 9. */
export const Season1: Story = {
  args: { cover: { collected: 10, total: 118, ratio: 10 / 118, latest: [] }, level: SAMPLE_LEVEL },
};
export const FreshAlbum: Story = { args: { cover: { collected: 0, total: 118, ratio: 0, latest: [] } } };
