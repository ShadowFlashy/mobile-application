import type { Meta, StoryObj } from '@storybook/react';
import { NoteRow } from './NoteRow';

const meta: Meta<typeof NoteRow> = { title: 'Garage/NoteRow', component: NoteRow };
export default meta;
type Story = StoryObj<typeof NoteRow>;

export const Explanation: Story = {
  args: {
    text: 'Pings start once your ownership is verified. During the beta the Redline team checks every owner by hand.',
  },
};
export const Fact: Story = { args: { text: 'Verified on 1 Nov 2026', tone: 'text' } };
export const WithoutDivider: Story = {
  args: { text: 'Not in the sticker book? Type the brand and model.', divider: false },
};
