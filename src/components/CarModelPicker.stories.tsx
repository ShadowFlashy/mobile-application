import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { CarModel } from '../types/CarModel';
import { CarModelPicker } from './CarModelPicker';

const SAMPLE_MODELS: CarModel[] = [
  { id: 'model-1', stickerNumber: 1, make: 'Porsche', model: '911 GT3', category: 'sports', rarity: 'rare' },
  { id: 'model-2', stickerNumber: 2, make: 'Porsche', model: 'Taycan Turbo S', category: 'electric', rarity: 'rare' },
  { id: 'model-3', stickerNumber: 3, make: 'Ferrari', model: 'SF90 Stradale', category: 'supercar', rarity: 'epic' },
  { id: 'model-4', stickerNumber: 4, make: 'Bugatti', model: 'Chiron', category: 'hypercar', rarity: 'legendary' },
  { id: 'model-5', stickerNumber: 5, make: 'Volkswagen', model: 'Golf GTI', category: 'icon', rarity: 'common' },
  { id: 'model-6', stickerNumber: 6, make: 'Nissan', model: 'Skyline GT-R R34', category: 'jdm', rarity: 'epic' },
  { id: 'model-7', stickerNumber: 7, make: 'Ford', model: 'Mustang Shelby GT500', category: 'muscle', rarity: 'rare' },
  {
    id: 'model-8',
    stickerNumber: 8,
    make: 'Mercedes-Benz',
    model: '300 SL Gullwing',
    category: 'classic',
    rarity: 'legendary',
  },
];

/** Holds the selection like the spot wizard does: search, pick a sticker, press Change to undo. */
function InteractivePicker() {
  const [selected, setSelected] = useState<CarModel>();
  return (
    <CarModelPicker
      models={SAMPLE_MODELS}
      selectedId={selected?.id}
      onSelect={(model) => setSelected(model)}
      isOtherSelected={selected === undefined}
    />
  );
}

const meta: Meta<typeof CarModelPicker> = {
  title: 'Components/CarModelPicker',
  component: CarModelPicker,
  args: { models: SAMPLE_MODELS, onSelect: () => {} },
};
export default meta;
type Story = StoryObj<typeof CarModelPicker>;

/** Type e.g. "porsche" to see matching stickers. */
export const Search: Story = { render: () => <InteractivePicker /> };

export const Selected: Story = { args: { selectedId: 'model-4', isOtherSelected: false } };

export const NotInStickerBook: Story = { args: { isOtherSelected: true } };
