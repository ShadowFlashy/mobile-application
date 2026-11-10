import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { PlateConfirmation } from '../../types/Capture';
import { PlateConfirm } from './PlateConfirm';

const meta: Meta<typeof PlateConfirm> = { title: 'Capture/PlateConfirm', component: PlateConfirm };
export default meta;
type Story = StoryObj<typeof PlateConfirm>;

function Interactive({ regionCount, ignoredCount }: { regionCount: number; ignoredCount: number }) {
  const [confirmation, setConfirmation] = useState<PlateConfirmation>();
  const [secondTap, setSecondTap] = useState(false);
  return (
    <PlateConfirm
      regionCount={regionCount}
      confirmation={confirmation}
      needsSecondTap={confirmation === 'none_visible' && ignoredCount > 0 && !secondTap}
      ignoredCount={ignoredCount}
      onConfirm={(value) => {
        setConfirmation(value);
        setSecondTap(false);
      }}
      onConfirmIgnored={() => setSecondTap(true)}
    />
  );
}

export const WithBoxes: Story = { render: () => <Interactive regionCount={2} ignoredCount={0} /> };
export const NoBoxYet: Story = { render: () => <Interactive regionCount={0} ignoredCount={0} /> };
export const CoDriverSawAPlate: Story = { render: () => <Interactive regionCount={0} ignoredCount={1} /> };
