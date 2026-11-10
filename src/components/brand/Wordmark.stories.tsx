import type { Meta, StoryObj } from '@storybook/react';
import { Wordmark } from './Wordmark';

const meta: Meta<typeof Wordmark> = { title: 'Brand/Wordmark', component: Wordmark };
export default meta;
type Story = StoryObj<typeof Wordmark>;

export const Large: Story = { args: {} };
export const Medium: Story = { args: { size: 'md' } };
