import type { Meta, StoryObj } from '@storybook/react';
import { VanityPlate } from './VanityPlate';

const meta: Meta<typeof VanityPlate> = { title: 'Components/VanityPlate', component: VanityPlate };
export default meta;
type Story = StoryObj<typeof VanityPlate>;

export const Default: Story = { args: { plate: 'GT3-RS' } };
export const Short: Story = { args: { plate: 'F40' } };
export const Long: Story = { args: { plate: '1-SPT-911' } };
