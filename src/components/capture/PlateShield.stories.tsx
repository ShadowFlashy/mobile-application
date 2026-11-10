import type { Meta, StoryObj } from '@storybook/react';
import { PlateShield } from './PlateShield';

const meta: Meta<typeof PlateShield> = { title: 'Capture/PlateShield', component: PlateShield };
export default meta;
type Story = StoryObj<typeof PlateShield>;

export const NotChecked: Story = { args: { count: 1 } };
export const Blurred: Story = { args: { count: 2, confirmation: 'blurred' } };
export const NoPlate: Story = { args: { count: 0, confirmation: 'none_visible' } };
