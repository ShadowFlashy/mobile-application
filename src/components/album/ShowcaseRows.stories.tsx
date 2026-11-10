import type { Meta, StoryObj } from '@storybook/react';
import { ShowcaseRows } from './ShowcaseRows';

const meta: Meta<typeof ShowcaseRows> = { title: 'Album/ShowcaseRows', component: ShowcaseRows };
export default meta;
type Story = StoryObj<typeof ShowcaseRows>;

export const Badge: Story = { args: { showcase: { visibility: 'badge', shoutout: 'Thanks for the spot' } } };
export const Vanity: Story = {
  args: { showcase: { visibility: 'vanity', shoutout: 'Thanks for the spot', vanityPlate: 'GTSI 80' } },
};
