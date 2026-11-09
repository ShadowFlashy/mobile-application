import type { Meta, StoryObj } from '@storybook/react';
import { PrivacyNotice } from './PrivacyNotice';

const meta: Meta<typeof PrivacyNotice> = { title: 'Components/PrivacyNotice', component: PrivacyNotice };
export default meta;
type Story = StoryObj<typeof PrivacyNotice>;

export const SpotWizard: Story = {
  args: {
    title: 'Licence plates stay private',
    children:
      'In the next step you hide every licence plate. The plate is blurred on your phone, so a readable plate is never uploaded.',
  },
};
export const OwnerPortal: Story = {
  args: {
    title: 'How your plate is protected',
    children:
      'Your plate is turned into a secret code on the server and only used to recognise your car when a spotter types it.',
  },
};
export const Short: Story = {
  args: { title: 'Typed plates are never stored', children: 'A plate you type is only used to ping the owner.' },
};
