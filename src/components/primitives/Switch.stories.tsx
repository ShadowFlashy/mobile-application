import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = { title: 'Primitives/Switch', component: Switch };
export default meta;
type Story = StoryObj<typeof Switch>;

function Interactive() {
  const [value, setValue] = useState(true);
  return (
    <Switch
      label="Co-Driver"
      description="Identify cars automatically. Plates are blurred on your phone first."
      value={value}
      onChange={setValue}
    />
  );
}

export const Default: Story = { render: () => <Interactive /> };
export const Off: Story = { args: { label: 'Haptics', value: false, onChange: () => undefined } };
export const Disabled: Story = {
  args: { label: 'Auto location', value: true, disabled: true, onChange: () => undefined },
};
