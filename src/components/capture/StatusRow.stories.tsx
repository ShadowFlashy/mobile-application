import type { Meta, StoryObj } from '@storybook/react';
import { StyledButton } from '../StyledButton';
import { StatusRow } from './StatusRow';

const meta: Meta<typeof StatusRow> = { title: 'Capture/StatusRow', component: StatusRow };
export default meta;
type Story = StoryObj<typeof StatusRow>;

export const Busy: Story = {
  args: {
    busy: true,
    title: 'Auto-fill is analysing…',
    actions: <StyledButton label="Fill in myself" variant="text" onPress={() => undefined} />,
  },
};
export const WithBody: Story = {
  args: {
    icon: 'offline',
    title: 'No connection for auto-fill',
    body: 'Auto-fill needs a connection. Fill in the car yourself.',
  },
};
