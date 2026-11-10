import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = { title: 'Primitives/Skeleton', component: Skeleton };
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Line: Story = { args: { width: 200, preset: 'line' } };
export const Row: Story = { args: { preset: 'row' } };
export const Photo: Story = { args: { preset: 'photo', shape: 'photo' } };
export const Circle: Story = { args: { width: 44, height: 44, shape: 'circle' } };
