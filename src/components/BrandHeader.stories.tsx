import type { Meta, StoryObj } from '@storybook/react';
import { BrandHeader } from './BrandHeader';

const meta: Meta<typeof BrandHeader> = { title: 'Components/BrandHeader', component: BrandHeader };
export default meta;
type Story = StoryObj<typeof BrandHeader>;

export const Login: Story = { args: { subtitle: 'Collect the cars you spot, like a sticker book.' } };
export const Register: Story = { args: { subtitle: 'Create your free sticker book.' } };
