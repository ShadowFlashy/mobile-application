import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';
import { TimingRow } from './TimingRow';

const meta: Meta<typeof TimingRow> = { title: 'Primitives/TimingRow', component: TimingRow };
export default meta;
type Story = StoryObj<typeof TimingRow>;

export const Default: Story = {
  args: {
    number: '82',
    title: 'Ferrari 308 GTSi',
    subtitle: 'Italian Exotics',
    meta: 'Today',
    rarity: 'epic',
    onPress: () => undefined,
  },
};

/** "Latest catches" as a timing tower. */
export const Tower: Story = {
  render: () => (
    <Stack>
      <TimingRow number="82" title="Ferrari 308 GTSi" subtitle="Italian Exotics" meta="Today" rarity="epic" />
      <TimingRow
        number="07"
        title="Porsche 911 GT3"
        titleSuffix="×3"
        subtitle="German Autobahn Heroes"
        meta="Yesterday"
        rarity="rare"
      />
      <TimingRow number="14" title="Lamborghini Huracán" subtitle="Italian Exotics" meta="6 Nov" rarity="epic" />
    </Stack>
  ),
};
