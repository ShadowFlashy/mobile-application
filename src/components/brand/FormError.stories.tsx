import type { Meta, StoryObj } from '@storybook/react';
import { FormError } from './FormError';

const meta: Meta<typeof FormError> = { title: 'Brand/FormError', component: FormError };
export default meta;
type Story = StoryObj<typeof FormError>;

export const Default: Story = { args: { message: 'Wrong email or password.' } };
export const Hidden: Story = { args: {} };
