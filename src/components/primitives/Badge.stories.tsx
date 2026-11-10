import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = { title: 'Primitives/Badge', component: Badge };
export default meta;
type Story = StoryObj<typeof Badge>;

export const One: Story = { args: { count: 1 } };
export const Capped: Story = { args: { count: 12 } };
export const LegacyLabel: Story = { args: { label: '2 new' } };
