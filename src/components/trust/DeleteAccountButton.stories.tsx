import type { Meta, StoryObj } from '@storybook/react';
import { DeleteAccountButton } from './DeleteAccountButton';

const meta: Meta<typeof DeleteAccountButton> = {
  title: 'Trust/DeleteAccountButton',
  component: DeleteAccountButton,
  args: { onConfirm: () => Promise.resolve(), isDeleting: false },
};
export default meta;
type Story = StoryObj<typeof DeleteAccountButton>;

export const Default: Story = {};

export const Deleting: Story = { args: { isDeleting: true } };

export const Disabled: Story = { args: { disabled: true } };
