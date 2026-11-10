import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = { title: 'Primitives/SegmentedControl', component: SegmentedControl };
export default meta;
type Story = StoryObj<typeof SegmentedControl>;

type Visibility = 'badge' | 'vanity';
type Contents = 'pages' | 'collections';

function Choice() {
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

function TextTabs() {
  const [value, setValue] = useState<Contents>('pages');
  return (
    <SegmentedControl<Contents>
      options={[
        { value: 'pages', label: 'Pages' },
        { value: 'collections', label: 'Collections' },
      ]}
      value={value}
      onChange={setValue}
      role="tab"
      accessibilityLabel="Album contents"
      testID="contents"
    />
  );
}

/** A setting choice (radio semantics). */
export const Default: Story = { render: () => <Choice /> };
/** A's text tabs ("Pages | Collections", tab semantics). */
export const Tabs: Story = { render: () => <TextTabs /> };
