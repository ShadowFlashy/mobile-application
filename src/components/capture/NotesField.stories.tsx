import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { NotesField } from './NotesField';

const meta: Meta<typeof NotesField> = { title: 'Capture/NotesField', component: NotesField };
export default meta;
type Story = StoryObj<typeof NotesField>;

function Interactive() {
  const [notes, setNotes] = useState('');
  return <NotesField value={notes} onChange={setNotes} />;
}

export const Collapsed: Story = { render: () => <Interactive /> };
export const WithNote: Story = {
  args: { value: 'Straight-piped, heard it before I saw it.', onChange: () => undefined },
};
