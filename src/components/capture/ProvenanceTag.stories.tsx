import type { Meta, StoryObj } from '@storybook/react';
import { ProvenanceTag } from './ProvenanceTag';

const meta: Meta<typeof ProvenanceTag> = { title: 'Capture/ProvenanceTag', component: ProvenanceTag };
export default meta;
type Story = StoryObj<typeof ProvenanceTag>;

export const AutoFill: Story = { args: { provenance: 'ai' } };
export const Auto: Story = { args: { provenance: 'auto' } };
export const You: Story = { args: { provenance: 'user' } };
