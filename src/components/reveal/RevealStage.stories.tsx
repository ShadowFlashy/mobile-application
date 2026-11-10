import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import type { RevealKind } from '../../types/Progress';
import { ACHIEVEMENTS_FIXTURE, pageFixture, pageProgressFixture, revealFixture, setsFixture } from './revealFixtures';
import { RevealStage } from './RevealStage';

interface RevealStoryArgs {
  kind: RevealKind;
  levelUp: boolean;
  setComplete: boolean;
  rewards: boolean;
}

/** Builds the reveal from the controls; the key replays the ritual whenever a control changes. */
function RevealStageStory({ kind, levelUp, setComplete, rewards }: RevealStoryArgs) {
  const reveal = revealFixture({ kind, levelUp, setComplete, rewards });
  return (
    <View style={{ height: 780 }}>
      <RevealStage
        key={`${kind}-${String(levelUp)}-${String(setComplete)}-${String(rewards)}`}
        reveal={reveal}
        page={pageFixture(reveal)}
        pageProgress={pageProgressFixture(reveal)}
        sets={setsFixture(reveal)}
        achievements={ACHIEVEMENTS_FIXTURE}
        onViewPage={() => undefined}
        onSpotAnother={() => undefined}
      />
    </View>
  );
}

const meta: Meta<typeof RevealStageStory> = {
  title: 'Reveal/RevealStage',
  component: RevealStageStory,
  argTypes: {
    kind: { control: 'select', options: ['new', 'duplicate', 'fresh_paint', 'wildcard'] },
    levelUp: { control: 'boolean' },
    setComplete: { control: 'boolean' },
    rewards: { control: 'boolean' },
  },
  args: { kind: 'new', levelUp: false, setComplete: false, rewards: false },
};
export default meta;
type Story = StoryObj<typeof RevealStageStory>;

export const NewSticker: Story = {};
export const Duplicate: Story = { args: { kind: 'duplicate' } };
export const FreshPaint: Story = { args: { kind: 'fresh_paint' } };
export const Wildcard: Story = { args: { kind: 'wildcard' } };
export const LevelUp: Story = { args: { levelUp: true, rewards: true } };
export const SetComplete: Story = { args: { setComplete: true, levelUp: true } };
