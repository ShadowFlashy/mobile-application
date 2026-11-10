import type { Meta, StoryObj } from '@storybook/react';
import { ShutterButton } from './ShutterButton';

const meta: Meta<typeof ShutterButton> = { title: 'Capture/ShutterButton', component: ShutterButton };
export default meta;
type Story = StoryObj<typeof ShutterButton>;

export const Default: Story = { args: { onPress: () => undefined } };
export const Loading: Story = { args: { onPress: () => undefined, isLoading: true } };
