import type { Meta, StoryObj } from '@storybook/react';
import { AiConsentSheet } from './AiConsentSheet';

const meta: Meta<typeof AiConsentSheet> = { title: 'Capture/AiConsentSheet', component: AiConsentSheet };
export default meta;
type Story = StoryObj<typeof AiConsentSheet>;

export const FirstUse: Story = { args: { visible: true, onAccept: () => undefined, onDecline: () => undefined } };
