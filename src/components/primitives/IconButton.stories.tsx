import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = { title: 'Primitives/IconButton', component: IconButton };
export default meta;
type Story = StoryObj<typeof IconButton>;

export const Plain: Story = { args: { icon: 'settings-outline', label: 'Settings', onPress: () => undefined } };
export const Filled: Story = {
  args: { icon: 'camera', label: 'Take photo', variant: 'filled', onPress: () => undefined },
};
export const WithBadge: Story = {
  args: { icon: 'notifications-outline', label: 'Sightings', badgeCount: 3, onPress: () => undefined },
};
export const OnStage: Story = { args: { icon: 'close', label: 'Close', variant: 'onStage', onPress: () => undefined } };
