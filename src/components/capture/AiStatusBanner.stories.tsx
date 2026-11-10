import type { Meta, StoryObj } from '@storybook/react';
import { AiStatusBanner } from './AiStatusBanner';

const meta: Meta<typeof AiStatusBanner> = { title: 'Capture/AiStatusBanner', component: AiStatusBanner };
export default meta;
type Story = StoryObj<typeof AiStatusBanner>;

export const Offline: Story = { args: { reason: 'offline' } };
export const Disabled: Story = { args: { reason: 'disabled' } };
export const NotConfigured: Story = { args: { reason: 'not_configured' } };
export const Quota: Story = { args: { reason: 'quota' } };
export const Busy: Story = { args: { reason: 'busy' } };
export const Timeout: Story = { args: { reason: 'timeout' } };
export const ProviderError: Story = { args: { reason: 'error' } };
export const Unsupported: Story = { args: { reason: 'unsupported' } };
