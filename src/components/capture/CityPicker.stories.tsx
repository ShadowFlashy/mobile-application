import type { Meta, StoryObj } from '@storybook/react';
import { CityPicker } from './CityPicker';

const meta: Meta<typeof CityPicker> = { title: 'Capture/CityPicker', component: CityPicker };
export default meta;
type Story = StoryObj<typeof CityPicker>;

export const Open: Story = {
  args: { visible: true, value: 'Leuven', onClose: () => undefined, onSelect: () => undefined },
};
