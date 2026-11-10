import type { Meta, StoryObj } from '@storybook/react';
import { DuplicateBanner } from './DuplicateBanner';

const meta: Meta<typeof DuplicateBanner> = { title: 'Capture/DuplicateBanner', component: DuplicateBanner };
export default meta;
type Story = StoryObj<typeof DuplicateBanner>;

export const Default: Story = {
  args: { spottedAt: '2026-11-03T13:12:00.000Z', onView: () => undefined, onSaveAnyway: () => undefined },
};
