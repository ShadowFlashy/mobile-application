import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CityField } from './CityField';

const meta: Meta<typeof CityField> = { title: 'Capture/CityField', component: CityField };
export default meta;
type Story = StoryObj<typeof CityField>;

function Interactive() {
  const [city, setCity] = useState('Leuven');
  return <CityField value={city} onChange={setCity} provenance="auto" />;
}

export const Auto: Story = { render: () => <Interactive /> };
export const Empty: Story = { args: { value: '', onChange: () => undefined } };
