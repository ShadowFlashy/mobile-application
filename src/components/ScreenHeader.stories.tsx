import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './primitives/Badge';
import { ScreenHeader } from './ScreenHeader';

const meta: Meta<typeof ScreenHeader> = { title: 'Components/ScreenHeader', component: ScreenHeader };
export default meta;
type Story = StoryObj<typeof ScreenHeader>;

export const TitleOnly: Story = { args: { title: 'Profile' } };
export const WithSubtitle: Story = { args: { title: 'Sticker book', subtitle: 'Hi Alex, happy spotting!' } };
export const WithAction: Story = {
  args: {
    title: 'Owner portal',
    subtitle: 'Own a special car? Register it and get a ping every time a spotter finds it.',
    right: <Badge label="2 new" variant="primary" />,
  },
};
