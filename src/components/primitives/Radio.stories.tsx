import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Radio } from './Radio';
import { Stack } from './Stack';

const meta: Meta<typeof Radio> = { title: 'Primitives/Radio', component: Radio };
export default meta;
type Story = StoryObj<typeof Radio>;

export const Unselected: Story = {
  args: { label: 'No plate visible', value: 'none', selected: false, onSelect: () => {} },
};
export const Selected: Story = {
  args: { label: 'No plate visible', value: 'none', selected: true, onSelect: () => {} },
};

function PlateCheck() {
  const [value, setValue] = useState<string | undefined>(undefined);
  return (
    <Stack>
      <Radio
        label="Every plate is blurred"
        description="Tap the box on the photo, or drag to draw one"
        value="blurred"
        selected={value === 'blurred'}
        onSelect={setValue}
      />
      <Radio label="No plate visible" value="none" selected={value === 'none'} onSelect={setValue} />
    </Stack>
  );
}

/** The plate check of the New spot review. */
export const Group: Story = { render: () => <PlateCheck /> };
