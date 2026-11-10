import type { Meta, StoryObj } from '@storybook/react';
import { NotACarCard } from './NotACarCard';

const meta: Meta<typeof NotACarCard> = { title: 'Capture/NotACarCard', component: NotACarCard };
export default meta;
type Story = StoryObj<typeof NotACarCard>;

export const Default: Story = { args: { onRetake: () => undefined, onFillManually: () => undefined } };
