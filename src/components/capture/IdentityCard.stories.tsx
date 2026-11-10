import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { CarChoice } from '../../utils/captureForm';
import { IdentityCard } from './IdentityCard';
import { SAMPLE_CANDIDATES, SAMPLE_MODELS } from './storyData';

const meta: Meta<typeof IdentityCard> = { title: 'Capture/IdentityCard', component: IdentityCard };
export default meta;
type Story = StoryObj<typeof IdentityCard>;

const GT3 = { carModelId: 'porsche-911-gt3', make: 'Porsche', model: '911 GT3', generation: '992', yearFrom: 2021 };
const EMPTY = { make: '', model: '', generation: '' };

interface StoryForm {
  carModelId?: string;
  make: string;
  model: string;
  generation: string;
}

/** Search "lambo", "eend" or "308", or choose "Not in the album" and type "Ferrari 308 GTSi". */
function Manual() {
  const [form, setForm] = useState<StoryForm>(EMPTY);
  const choose = (choice: CarChoice) =>
    setForm(
      choice.kind === 'model'
        ? { carModelId: choice.model.id, make: choice.model.make, model: choice.model.model, generation: '' }
        : { make: choice.make, model: choice.model, generation: '' },
    );
  return <IdentityCard form={form} models={SAMPLE_MODELS} onChooseCar={choose} />;
}

export const Sure: Story = {
  args: {
    form: GT3,
    models: SAMPLE_MODELS,
    provenance: 'ai',
    tier: 'sure',
    confidence: 0.94,
    funFact: 'The 992 GT3 revs to 9,000 rpm and still has a manual gearbox option.',
    onChooseCar: () => undefined,
  },
};
export const Likely: Story = {
  args: {
    form: GT3,
    models: SAMPLE_MODELS,
    provenance: 'ai',
    tier: 'likely',
    confidence: 0.7,
    onChooseCar: () => undefined,
  },
};
export const Guess: Story = {
  args: {
    form: EMPTY,
    models: SAMPLE_MODELS,
    tier: 'guess',
    confidence: 0.55,
    candidates: SAMPLE_CANDIDATES,
    onChooseCar: () => undefined,
  },
};
export const Analysing: Story = {
  args: { form: EMPTY, models: SAMPLE_MODELS, isAnalysing: true, onChooseCar: () => undefined },
};
export const ManualSearch: Story = { render: () => <Manual /> };
