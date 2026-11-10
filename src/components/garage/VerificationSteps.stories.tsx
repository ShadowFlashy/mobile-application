import type { Meta, StoryObj } from '@storybook/react';
import { VerificationSteps } from './VerificationSteps';

const meta: Meta<typeof VerificationSteps> = { title: 'Garage/VerificationSteps', component: VerificationSteps };
export default meta;
type Story = StoryObj<typeof VerificationSteps>;

/** The beta flow of a car that is waiting for verification. */
export const InProgress: Story = {
  args: {
    title: 'How it works',
    steps: [
      { key: 'add', title: 'Add your car', body: 'Your plate is stored as a code, never as text.', state: 'done' },
      {
        key: 'check',
        title: 'The Redline team checks your ownership',
        body: 'During the beta this happens by hand, after a check outside the app.',
        state: 'current',
      },
      { key: 'pings', title: 'Pings start', state: 'todo' },
    ],
  },
};

/** Plain numbered instructions, without progress. */
export const Instructions: Story = {
  args: {
    title: 'Verify with a code',
    steps: [
      { key: 'write', title: 'Write the code on paper or show it on another screen.' },
      { key: 'place', title: 'Put it behind the windscreen.' },
      { key: 'photo', title: 'Photograph the car so the plate and the code are both readable.' },
    ],
  },
};
