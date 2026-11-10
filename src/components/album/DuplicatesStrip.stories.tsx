import type { Meta, StoryObj } from '@storybook/react';
import { porsche, SAMPLE_SPOTS } from './albumFixtures';
import { DuplicatesStrip } from './DuplicatesStrip';

const meta: Meta<typeof DuplicatesStrip> = { title: 'Album/DuplicatesStrip', component: DuplicatesStrip };
export default meta;
type Story = StoryObj<typeof DuplicatesStrip>;

export const ThreeSpots: Story = {
  args: { spots: SAMPLE_SPOTS.filter((spot) => spot.carModelId === porsche.id), onPressSpot: () => undefined },
};
export const OneSpot: Story = { args: { spots: SAMPLE_SPOTS.slice(0, 1), onPressSpot: () => undefined } };
