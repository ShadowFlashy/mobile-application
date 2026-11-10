import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = { title: 'Primitives/SegmentedControl', component: SegmentedControl };
export default meta;
type Story = StoryObj<typeof SegmentedControl>;

type Visibility = 'badge' | 'vanity';

function Interactive() {
  const [value, setValue] = useState<Visibility>('badge');
  return (
    <SegmentedControl<Visibility>
      options={[
        { value: 'badge', label: 'Owner badge' },
        { value: 'vanity', label: 'Vanity plate' },
      ]}
      value={value}
      onChange={setValue}
      testID="visibility"
    />
  );
}

export const Default: Story = { render: () => <Interactive /> };
