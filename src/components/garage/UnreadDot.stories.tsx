import type { Meta, StoryObj } from '@storybook/react';
import { UnreadDot } from './UnreadDot';

const meta: Meta<typeof UnreadDot> = { title: 'Garage/UnreadDot', component: UnreadDot };
export default meta;
type Story = StoryObj<typeof UnreadDot>;

export const Default: Story = {};
