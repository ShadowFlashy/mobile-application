import type { Meta, StoryObj } from '@storybook/react';
import { PrivacyDocument } from './PrivacyDocument';

const meta: Meta<typeof PrivacyDocument> = {
  title: 'Trust/PrivacyDocument',
  component: PrivacyDocument,
};
export default meta;
type Story = StoryObj<typeof PrivacyDocument>;

export const Policy: Story = {};
