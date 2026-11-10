import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { OwnerPingRow } from './OwnerPingRow';

const meta: Meta<typeof OwnerPingRow> = { title: 'Capture/OwnerPingRow', component: OwnerPingRow };
export default meta;
type Story = StoryObj<typeof OwnerPingRow>;

function Interactive({ plate }: { plate: string }) {
  const [value, setValue] = useState({ plate, notifyOwner: plate.length > 0, shareNameWithOwner: false });
  return (
    <OwnerPingRow
      value={value}
      onChange={(patch) => setValue((current) => ({ ...current, ...patch }))}
      provenance={plate.length > 0 ? 'ai' : undefined}
    />
  );
}

export const ReadByAutoFill: Story = { render: () => <Interactive plate="1ABC234" /> };
export const Manual: Story = { render: () => <Interactive plate="" /> };
