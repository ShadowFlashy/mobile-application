import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmDialog } from './ConfirmDialog';
import { InputField } from './primitives/InputField';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  args: { visible: true, onConfirm: () => {}, onCancel: () => {} },
};
export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
  args: {
    title: 'Hide your plate?',
    message: 'Your plate will no longer be shown on spots of your car.',
    confirmLabel: 'Hide plate',
  },
};

export const Destructive: Story = {
  args: {
    title: 'Delete this spot?',
    message: 'The photo is removed for good. This cannot be undone.',
    confirmLabel: 'Delete',
    destructive: true,
  },
};

export const Busy: Story = {
  args: {
    title: 'Remove this car?',
    message: 'You will no longer be pinged when it is spotted.',
    confirmLabel: 'Remove car',
    destructive: true,
    isLoading: true,
  },
};

/** Extra content, e.g. a field to confirm the licence plate. */
export const WithContent: Story = {
  args: {
    title: 'Show your vanity plate?',
    message: 'Your plate will be shown as text on every spot of your car. Photos stay blurred.',
    confirmLabel: 'Show plate',
    children: <InputField label="Confirm your licence plate" value="" onChangeText={() => {}} />,
  },
};
