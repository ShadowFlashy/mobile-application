import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DateField } from './DateField';

const meta: Meta<typeof DateField> = { title: 'Capture/DateField', component: DateField };
export default meta;
type Story = StoryObj<typeof DateField>;

function Interactive() {
  const [value, setValue] = useState('2026-11-03T13:12:00.000Z');
  return <DateField value={value} onChange={setValue} provenance="auto" />;
}

export const FromExif: Story = { render: () => <Interactive /> };
export const EditedByYou: Story = {
  args: { value: '2026-11-09T18:30:00.000Z', provenance: 'user', onChange: () => undefined },
};
