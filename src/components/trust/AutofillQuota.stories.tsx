import type { Meta, StoryObj } from '@storybook/react';
import { AutofillQuota } from './AutofillQuota';

const meta: Meta<typeof AutofillQuota> = {
  title: 'Trust/AutofillQuota',
  component: AutofillQuota,
  args: { aiEnabled: true, left: 12, limit: 15 },
};
export default meta;
type Story = StoryObj<typeof AutofillQuota>;

export const Default: Story = {};

export const AllUsed: Story = { args: { left: 0 } };

export const AutofillOff: Story = { args: { aiEnabled: false } };

export const Offline: Story = { args: { left: undefined, limit: undefined } };
