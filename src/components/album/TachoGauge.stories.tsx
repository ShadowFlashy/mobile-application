import type { Meta, StoryObj } from '@storybook/react';
import { TachoGauge } from './TachoGauge';

const meta: Meta<typeof TachoGauge> = { title: 'Album/TachoGauge', component: TachoGauge };
export default meta;
type Story = StoryObj<typeof TachoGauge>;

export const Empty: Story = { args: { ratio: 0, label: 'Album completion', valueLabel: '0 %', size: 'lg' } };
export const Halfway: Story = { args: { ratio: 0.48, label: 'Album completion', valueLabel: '48 %', size: 'lg' } };
export const RedZone: Story = { args: { ratio: 0.92, label: 'Album completion', valueLabel: '92 %', size: 'lg' } };
export const Medium: Story = { args: { ratio: 0.25, label: 'Album completion', valueLabel: '25 %', size: 'md' } };
