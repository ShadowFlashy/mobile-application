import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = { title: 'Primitives/Toast', component: Toast };
export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = { args: { message: 'Sticker added', visible: true, bottomOffset: 0 } };
export const Success: Story = { args: { message: 'Saved', variant: 'success', visible: true, bottomOffset: 0 } };
export const ErrorVariant: Story = {
  args: { message: 'Something went wrong', variant: 'error', visible: true, bottomOffset: 0 },
};
export const Warning: Story = {
  args: { message: 'Auto-fill is busy. Fill it in yourself.', variant: 'warning', visible: true, bottomOffset: 0 },
};
export const WithAction: Story = {
  args: {
    message: 'A new version of Redline is ready.',
    visible: true,
    bottomOffset: 0,
    action: { label: 'Reload', onPress: () => undefined },
  },
};
