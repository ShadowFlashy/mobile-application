import type { Meta, StoryObj } from '@storybook/react';
import { OwnerVisibilityTable } from './OwnerVisibilityTable';

const meta: Meta<typeof OwnerVisibilityTable> = {
  title: 'Trust/OwnerVisibilityTable',
  component: OwnerVisibilityTable,
};
export default meta;
type Story = StoryObj<typeof OwnerVisibilityTable>;

export const NameHidden: Story = { args: { shareName: false } };

export const NameShared: Story = { args: { shareName: true } };
