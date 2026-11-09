import type { Meta, StoryObj } from '@storybook/react';
import { StepIndicator } from './StepIndicator';

/** The steps of the "spot a car" wizard. */
const spotSteps = ['Photo', 'Hide plates', 'Details'];

const meta: Meta<typeof StepIndicator> = { title: 'Components/StepIndicator', component: StepIndicator };
export default meta;
type Story = StoryObj<typeof StepIndicator>;

export const FirstStep: Story = { args: { steps: spotSteps, currentIndex: 0 } };
export const SecondStep: Story = { args: { steps: spotSteps, currentIndex: 1 } };
export const LastStep: Story = { args: { steps: spotSteps, currentIndex: 2 } };
