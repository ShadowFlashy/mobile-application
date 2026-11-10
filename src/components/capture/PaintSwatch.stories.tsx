import type { Meta, StoryObj } from '@storybook/react';
import { PaintSwatch } from './PaintSwatch';

const meta: Meta<typeof PaintSwatch> = { title: 'Capture/PaintSwatch', component: PaintSwatch };
export default meta;
type Story = StoryObj<typeof PaintSwatch>;

export const Medium: Story = { args: { paint: 'blue', size: 'md' } };
export const Selected: Story = { args: { paint: 'red', size: 'md', selected: true } };
export const Small: Story = { args: { paint: 'yellow', size: 'sm' } };
export const Other: Story = { args: { paint: 'other', size: 'md' } };
