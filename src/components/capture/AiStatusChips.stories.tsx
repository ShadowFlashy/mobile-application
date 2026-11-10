import type { Meta, StoryObj } from '@storybook/react';
import { AiStatusChips } from './AiStatusChips';

const meta: Meta<typeof AiStatusChips> = { title: 'Capture/AiStatusChips', component: AiStatusChips };
export default meta;
type Story = StoryObj<typeof AiStatusChips>;

export const AllOn: Story = { args: { aiEnabled: true, autoLocation: true, remaining: 12, isOnline: true } };
export const CoDriverOff: Story = { args: { aiEnabled: false, autoLocation: false, isOnline: true } };
export const Offline: Story = { args: { aiEnabled: true, autoLocation: true, remaining: 1, isOnline: false } };
