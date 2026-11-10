import type { Meta, StoryObj } from '@storybook/react';
import { KerbStripe } from './KerbStripe';

const meta: Meta<typeof KerbStripe> = { title: 'Primitives/KerbStripe', component: KerbStripe };
export default meta;
type Story = StoryObj<typeof KerbStripe>;

export const Thin: Story = { args: { height: 4 } };
export const Thick: Story = { args: { height: 8 } };
