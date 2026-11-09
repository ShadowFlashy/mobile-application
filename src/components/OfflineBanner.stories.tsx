import type { Meta, StoryObj } from '@storybook/react';
import { OfflineBanner } from './OfflineBanner';

const meta: Meta<typeof OfflineBanner> = { title: 'Components/OfflineBanner', component: OfflineBanner };
export default meta;
type Story = StoryObj<typeof OfflineBanner>;

export const Offline: Story = { args: { visible: true } };

/** Online: the banner renders nothing. */
export const Online: Story = { args: { visible: false } };
