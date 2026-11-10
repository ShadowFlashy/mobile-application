import type { Meta, StoryObj } from '@storybook/react';
import { DetailRow } from './DetailRow';
import { PaintSwatch } from './PaintSwatch';

const meta: Meta<typeof DetailRow> = { title: 'Capture/DetailRow', component: DetailRow };
export default meta;
type Story = StoryObj<typeof DetailRow>;

export const FromPhoto: Story = {
  args: {
    label: 'Date',
    value: '10 Nov 2026, 14:32',
    provenance: 'auto',
    onPress: () => undefined,
    accessibilityLabel: 'Date: 10 Nov 2026, 14:32',
  },
};
export const Empty: Story = {
  args: {
    label: 'City',
    value: '',
    placeholder: 'Pick a city',
    onPress: () => undefined,
    accessibilityLabel: 'City: Pick a city',
  },
};
export const WithDot: Story = {
  args: {
    label: 'Paint',
    value: 'Orange',
    provenance: 'ai',
    leading: <PaintSwatch paint="orange" size="sm" dotOnly />,
    onPress: () => undefined,
    accessibilityLabel: 'Paint: Orange',
  },
};
