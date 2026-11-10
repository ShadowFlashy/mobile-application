import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = { title: 'Primitives/Switch', component: Switch };
export default meta;
type Story = StoryObj<typeof Switch>;

function Interactive() {
  const [value, setValue] = useState(false);
  return (
    <Switch
      label="Notify the owner"
      description="Ping the owner if registered"
      value={value}
      onChange={setValue}
      divider
    />
  );
}

export const Default: Story = { render: () => <Interactive /> };
export const On: Story = { args: { label: 'Auto-fill', value: true, onChange: () => undefined } };
export const Disabled: Story = {
  args: { label: 'Auto location', value: true, disabled: true, onChange: () => undefined },
};
