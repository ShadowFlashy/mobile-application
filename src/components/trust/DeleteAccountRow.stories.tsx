import type { Meta, StoryObj } from '@storybook/react';
import { DeleteAccountRow } from './DeleteAccountRow';

const meta: Meta<typeof DeleteAccountRow> = {
  title: 'Trust/DeleteAccountRow',
  component: DeleteAccountRow,
  args: { onConfirm: () => Promise.resolve(), isDeleting: false },
};
export default meta;
type Story = StoryObj<typeof DeleteAccountRow>;

export const Default: Story = {};

export const Deleting: Story = { args: { isDeleting: true } };

export const Disabled: Story = { args: { disabled: true } };
