import type { Meta, StoryObj } from '@storybook/react';
import { OdometerCounter } from './OdometerCounter';

const meta: Meta<typeof OdometerCounter> = {
  title: 'Reveal/OdometerCounter',
  component: OdometerCounter,
  args: { value: 365, suffix: 'XP' },
};
export default meta;
type Story = StoryObj<typeof OdometerCounter>;

export const Static: Story = {};
export const Rolling: Story = { args: { animateFrom: 0 } };
export const ZeroPadded: Story = { args: { value: 4210, digits: 6, animateFrom: 3920, suffix: undefined } };
export const Small: Story = { args: { size: 'md', value: 42 } };
