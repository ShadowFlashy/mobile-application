import type { Meta, StoryObj } from '@storybook/react';
import { LevelUpBanner } from './LevelUpBanner';

const meta: Meta<typeof LevelUpBanner> = {
  title: 'Reveal/LevelUpBanner',
  component: LevelUpBanner,
  args: { level: 6, titleKey: 'car_park_hunter', previousTitleKey: 'kerbside_scout' },
};
export default meta;
type Story = StoryObj<typeof LevelUpBanner>;

export const NewTitle: Story = {};
export const SameTitle: Story = { args: { level: 4, titleKey: 'kerbside_scout', previousTitleKey: 'kerbside_scout' } };
