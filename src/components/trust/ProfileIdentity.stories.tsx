import type { Meta, StoryObj } from '@storybook/react';
import { ProfileIdentity } from './ProfileIdentity';

const meta: Meta<typeof ProfileIdentity> = {
  title: 'Trust/ProfileIdentity',
  component: ProfileIdentity,
  args: { name: 'tester', email: 'tester@redline.test', testID: 'driver-card' },
};
export default meta;
type Story = StoryObj<typeof ProfileIdentity>;

export const Default: Story = {};

export const TwoWordName: Story = { args: { name: 'Jasper Degreef' } };

export const OfflineReadOnly: Story = { args: { isOffline: true } };

export const NoEmail: Story = { args: { email: undefined } };
