import type { Meta, StoryObj } from '@storybook/react';
import { CollectBar } from './CollectBar';

const meta: Meta<typeof CollectBar> = { title: 'Capture/CollectBar', component: CollectBar };
export default meta;
type Story = StoryObj<typeof CollectBar>;

export const Ready: Story = { args: { gate: { ok: true }, result: '#31 · +125 XP', onCollect: () => undefined } };
export const CheckPlates: Story = {
  args: { gate: { ok: false, reason: 'confirm_plates' }, onCollect: () => undefined },
};
export const Offline: Story = { args: { gate: { ok: false, reason: 'offline' }, onCollect: () => undefined } };
export const Saving: Story = {
  args: { gate: { ok: false, reason: 'busy' }, isSaving: true, onCollect: () => undefined },
};
export const SaveFailed: Story = {
  args: {
    gate: { ok: true },
    saveError: 'Your spot could not be saved. Please try again.',
    onCollect: () => undefined,
  },
};
