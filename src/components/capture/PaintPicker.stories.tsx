import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { PaintColor } from '../../types/CarModel';
import { PaintPicker } from './PaintPicker';

const meta: Meta<typeof PaintPicker> = { title: 'Capture/PaintPicker', component: PaintPicker };
export default meta;
type Story = StoryObj<typeof PaintPicker>;

function Interactive() {
  const [paint, setPaint] = useState<PaintColor>('blue');
  return <PaintPicker value={paint} onChange={setPaint} provenance="ai" />;
}

export const FromAutoFill: Story = { render: () => <Interactive /> };
export const Analysing: Story = { args: { value: 'other', onChange: () => undefined, isAnalysing: true } };
