import type { Meta, StoryObj } from '@storybook/react';
import { PaintValue } from './PaintValue';

const meta: Meta<typeof PaintValue> = { title: 'Album/PaintValue', component: PaintValue };
export default meta;
type Story = StoryObj<typeof PaintValue>;

export const Orange: Story = { args: { paint: 'orange' } };
export const White: Story = { args: { paint: 'white' } };
export const Other: Story = { args: { paint: 'other' } };
