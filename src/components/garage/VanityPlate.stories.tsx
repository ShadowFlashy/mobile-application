import type { Meta, StoryObj } from '@storybook/react';
import { VanityPlate } from './VanityPlate';

const meta: Meta<typeof VanityPlate> = { title: 'Garage/VanityPlate', component: VanityPlate };
export default meta;
type Story = StoryObj<typeof VanityPlate>;

export const Default: Story = { args: { plate: 'DEMO-123' } };
export const Large: Story = { args: { plate: 'MAGNUM', size: 'lg' } };
