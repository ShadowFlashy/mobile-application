import type { Meta, StoryObj } from '@storybook/react';
import { AnalysingChip } from './AnalysingChip';

const meta: Meta<typeof AnalysingChip> = { title: 'Capture/AnalysingChip', component: AnalysingChip };
export default meta;
type Story = StoryObj<typeof AnalysingChip>;

export const Default: Story = { args: { onFillManually: () => undefined } };
