import type { Meta, StoryObj } from '@storybook/react';
import { SightingDayHeading } from './SightingDayHeading';

const meta: Meta<typeof SightingDayHeading> = { title: 'Garage/SightingDayHeading', component: SightingDayHeading };
export default meta;
type Story = StoryObj<typeof SightingDayHeading>;

export const Today: Story = { args: { label: 'Today' } };
export const EarlierDay: Story = { args: { label: '6 Nov 2026' } };
