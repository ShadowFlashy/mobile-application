import type { Meta, StoryObj } from '@storybook/react';
import { sampleAchievements } from './fixtures';
import { DashPlaque } from './DashPlaque';

const meta: Meta<typeof DashPlaque> = { title: 'Progress/DashPlaque', component: DashPlaque };
export default meta;
type Story = StoryObj<typeof DashPlaque>;

const [gold, bronze, silver, locked, , secret] = sampleAchievements;

export const Gold: Story = { args: { achievement: gold } };
export const Silver: Story = { args: { achievement: silver, isNew: true, onPress: () => undefined } };
export const Bronze: Story = { args: { achievement: bronze } };
export const LockedWithProgress: Story = { args: { achievement: locked } };
export const Secret: Story = { args: { achievement: secret } };
