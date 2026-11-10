import type { Meta, StoryObj } from '@storybook/react';
import { ShiftLights } from './ShiftLights';

const meta: Meta<typeof ShiftLights> = { title: 'Progress/ShiftLights', component: ShiftLights };
export default meta;
type Story = StoryObj<typeof ShiftLights>;

export const LevelProgress: Story = { args: { ratio: 0.68, leds: 15, label: '68% of the way to level 10' } };
export const Confidence: Story = { args: { ratio: 0.94, leds: 5, label: 'Co-Driver is sure' } };
export const Empty: Story = { args: { ratio: 0, leds: 15, label: '0% of the way to level 2' } };
export const AtTheRedline: Story = { args: { ratio: 1, leds: 15, blink: true, label: 'Shift up!' } };
