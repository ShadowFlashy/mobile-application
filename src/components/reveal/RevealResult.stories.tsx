import type { Meta, StoryObj } from '@storybook/react';
import { RevealHero } from './RevealHero';
import { RevealResult } from './RevealResult';
import {
  pageFixture,
  pageProgressFixture,
  revealFixture,
  setsFixture,
  type RevealFixtureOptions,
} from './revealFixtures';

function args(options: RevealFixtureOptions = {}) {
  const reveal = revealFixture(options);
  return {
    reveal,
    page: pageFixture(reveal),
    pageProgress: pageProgressFixture(reveal),
    sets: setsFixture(reveal),
    onDone: () => undefined,
    onSpotAnother: () => undefined,
  };
}

const meta: Meta<typeof RevealResult> = { title: 'Reveal/RevealResult', component: RevealResult, args: args() };
export default meta;
type Story = StoryObj<typeof RevealResult>;

export const NewSticker: Story = {};
export const LevelUpWithRewards: Story = { args: args({ levelUp: true, rewards: true }) };
export const SetComplete: Story = { args: args({ setComplete: true }) };
export const Duplicate: Story = { args: args({ kind: 'duplicate' }) };
export const FreshPaint: Story = { args: args({ kind: 'fresh_paint' }) };
export const Wildcard: Story = { args: args({ kind: 'wildcard' }) };
export const Hero: Story = { render: () => <RevealHero reveal={revealFixture()} setTitle="Italian Exotics" /> };
