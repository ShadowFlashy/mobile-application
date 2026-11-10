import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { OwnerVisibility } from '../../types/OwnerCar';
import { VisibilityPicker } from './VisibilityPicker';

const meta: Meta<typeof VisibilityPicker> = { title: 'Garage/VisibilityPicker', component: VisibilityPicker };
export default meta;
type Story = StoryObj<typeof VisibilityPicker>;

/** Car settings of a verified car that is not showing its plate yet: Vanity needs the plate re-entered. */
function Interactive({ isPending = false }: { isPending?: boolean }) {
  const [value, setValue] = useState<OwnerVisibility>('hidden');
  const [plate, setPlate] = useState('');
  return (
    <VisibilityPicker
      value={value}
      onChange={setValue}
      needsPlate
      plate={plate}
      onPlateChange={setPlate}
      isPending={isPending}
    />
  );
}

export const Default: Story = { render: () => <Interactive /> };
export const PendingCar: Story = { render: () => <Interactive isPending /> };
export const VanityPlateError: Story = {
  args: {
    value: 'vanity',
    onChange: () => undefined,
    needsPlate: true,
    plate: 'X',
    onPlateChange: () => undefined,
    plateError: 'Enter your licence plate (2 to 12 letters or digits).',
  },
};
