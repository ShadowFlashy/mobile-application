import type { Meta, StoryObj } from '@storybook/react';
import { VerificationCodeCard } from './VerificationCodeCard';

const meta: Meta<typeof VerificationCodeCard> = {
  title: 'Garage/VerificationCodeCard (P1)',
  component: VerificationCodeCard,
};
export default meta;
type Story = StoryObj<typeof VerificationCodeCard>;

export const Counting: Story = {
  args: { code: 'RL-7K3QX9', expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() },
};
export const Expired: Story = { args: { code: 'RL-7K3QX9', expiresAt: '2026-01-01T00:00:00Z' } };
