import type { Meta, StoryObj } from '@storybook/react';
import { RevealCtas } from './RevealCtas';

const meta: Meta<typeof RevealCtas> = {
  title: 'Reveal/RevealCtas',
  component: RevealCtas,
  args: { phase: 'stick', onStick: () => undefined, onViewPage: () => undefined, onSpotAnother: () => undefined },
  argTypes: { phase: { control: 'select', options: ['stick', 'sticking', 'final'] } },
};
export default meta;
type Story = StoryObj<typeof RevealCtas>;

export const StickIt: Story = {};
export const Sticking: Story = { args: { phase: 'sticking' } };
export const Final: Story = { args: { phase: 'final' } };
