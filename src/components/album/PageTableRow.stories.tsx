import type { Meta, StoryObj } from '@storybook/react';
import { PageTableRow } from './PageTableRow';

const meta: Meta<typeof PageTableRow> = { title: 'Album/PageTableRow', component: PageTableRow };
export default meta;
type Story = StoryObj<typeof PageTableRow>;

export const Sports: Story = {
  args: {
    number: '02',
    title: 'Sports',
    count: '2/17',
    progress: 2 / 17,
    accessibilityLabel: 'Page 2, Sports: 2 of 17 collected',
    onPress: () => undefined,
  },
};
export const Wildcards: Story = {
  args: {
    number: '09',
    title: 'Wildcards',
    count: '1',
    accessibilityLabel: 'Wildcards: 1 car',
    onPress: () => undefined,
  },
};
