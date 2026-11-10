import type { Meta, StoryObj } from '@storybook/react';
import { BrandMark } from './BrandMark';

const meta: Meta<typeof BrandMark> = { title: 'Brand/BrandMark', component: BrandMark };
export default meta;
type Story = StoryObj<typeof BrandMark>;

export const Default: Story = { args: {} };
export const Large: Story = { args: { size: 128, decorative: false } };
