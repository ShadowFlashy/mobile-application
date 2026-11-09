import type { Meta, StoryObj } from '@storybook/react';
import type { Spot } from '../types/Spot';
import { SpotCard } from './SpotCard';

/**
 * Stand-in photo: an inline SVG car silhouette as a data URI, so the stories need no network and
 * no signed URL. It is drawn with opacity only, it has no colours of its own.
 */
const SAMPLE_PHOTO_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">',
    '<rect width="160" height="120" fill-opacity="0.12"/>',
    '<path d="M14 84 L26 66 Q32 58 46 56 L62 44 Q70 38 84 38 L104 38 Q118 38 126 50 L134 60 Q148 62 150 74 L150 84 Z" fill-opacity="0.55"/>',
    '<circle cx="46" cy="86" r="12" fill-opacity="0.85"/>',
    '<circle cx="120" cy="86" r="12" fill-opacity="0.85"/>',
    '</svg>',
  ].join(''),
)}`;

const HOUR = 60 * 60 * 1000;

/** Dates relative to now, so the relative date ("2 hours ago") stays realistic. */
function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * HOUR).toISOString();
}

const porscheSpot: Spot = {
  id: 'spot-porsche',
  userId: 'user-1',
  carModelId: 'model-porsche-911-gt3-rs',
  make: 'Porsche',
  model: '911 GT3 RS',
  photoPath: 'user-1/spot-porsche-911.jpg',
  photoUrl: SAMPLE_PHOTO_URL,
  locationLabel: 'Grote Markt, Leuven',
  spottedAt: hoursAgo(2),
};

const ferrariSpot: Spot = {
  id: 'spot-ferrari',
  userId: 'user-1',
  carModelId: 'model-ferrari-f40',
  make: 'Ferrari',
  model: 'F40',
  photoPath: 'user-1/spot-ferrari-f40.jpg',
  photoUrl: SAMPLE_PHOTO_URL,
  spottedAt: hoursAgo(30),
};

/** A car that is not in the sticker book ("other find"), spotted weeks ago, photo not loaded. */
const lanciaSpot: Spot = {
  id: 'spot-lancia',
  userId: 'user-1',
  make: 'Lancia',
  model: 'Delta HF Integrale',
  photoPath: 'user-1/spot-lancia-delta.jpg',
  locationLabel: 'Meir, Antwerpen',
  spottedAt: hoursAgo(21 * 24),
};

const meta: Meta<typeof SpotCard> = { title: 'Components/SpotCard', component: SpotCard };
export default meta;
type Story = StoryObj<typeof SpotCard>;

export const WithLocation: Story = { args: { spot: porscheSpot, onPress: () => {} } };
export const WithoutLocation: Story = { args: { spot: ferrariSpot, onPress: () => {} } };
export const OlderWithoutPhoto: Story = { args: { spot: lanciaSpot, onPress: () => {} } };
