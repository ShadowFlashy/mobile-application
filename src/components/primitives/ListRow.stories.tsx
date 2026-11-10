import type { Meta, StoryObj } from '@storybook/react';
import { StyledButton } from '../StyledButton';
import { Icon } from './Icon';
import { ListRow } from './ListRow';
import { RarityRoundel } from './RarityRoundel';
import { Stack } from './Stack';
import { Text } from './Text';

const meta: Meta<typeof ListRow> = { title: 'Primitives/ListRow', component: ListRow };
export default meta;
type Story = StoryObj<typeof ListRow>;

export const Default: Story = { args: { title: 'Log 3 spots', pitch: 'compact' } };
export const TwoLines: Story = {
  args: {
    title: 'Toyota Supra (A80)',
    subtitle: 'A80 generation · 1993–2002',
    kind: 'primary',
    trailing: <StyledButton label="Change" variant="text" onPress={() => undefined} />,
  },
};
export const Detail: Story = { args: { title: 'Date', value: '10 Nov 2026, 14:32', kind: 'detail' } };
export const Navigation: Story = { args: { title: 'Privacy', chevron: true, onPress: () => undefined } };

/** A's lists: rows separated by hairlines, the challenge pattern with a count and +XP. */
export const ChallengeList: Story = {
  render: () => (
    <Stack>
      <ListRow
        title="Log 3 spots"
        pitch="compact"
        trailing={
          <Text variant="num" align="right">
            2/3
          </Text>
        }
      />
      <ListRow
        title="Spot 1 Epic or rarer car"
        pitch="compact"
        muted
        trailing={<Icon name="check" accessibilityLabel="Done" />}
      />
      <ListRow title="#31 New sticker" subtitle="06 JDM" trailing={<RarityRoundel rarity="epic" showLabel />} />
    </Stack>
  ),
};
