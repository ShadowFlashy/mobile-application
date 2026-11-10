import type { Meta, StoryObj } from '@storybook/react';
import { levelForXp } from '../../utils/progression';
import { sampleLevel } from './fixtures';
import { XpSummary } from './XpSummary';

const meta: Meta<typeof XpSummary> = { title: 'Progress/XpSummary', component: XpSummary };
export default meta;
type Story = StoryObj<typeof XpSummary>;

export const MidSeason: Story = { args: { level: sampleLevel } };
export const Rookie: Story = { args: { level: levelForXp(0) } };
export const ShiftUp: Story = { args: { level: levelForXp(4500), blink: true } };
