import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { PickedPhoto, PlateRegion } from '../types/Spot';
import { PlateRedactor } from './PlateRedactor';

/**
 * Generated stand-in for a camera photo: an inline SVG of a car's rear with a licence plate, so
 * the story needs no network and no binary asset. These colours belong to the fake photo itself,
 * not to the UI, which is why they do not come from the theme.
 */
const SAMPLE_PHOTO_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">',
  '<rect width="800" height="600" fill="#BAE6FD"/>',
  '<rect y="400" width="800" height="200" fill="#64748B"/>',
  '<path d="M250 260 L300 150 H500 L550 260 Z" fill="#1E3A8A"/>',
  '<path d="M285 250 L322 172 H478 L515 250 Z" fill="#0F172A"/>',
  '<rect x="180" y="240" width="440" height="200" rx="36" fill="#1D4ED8"/>',
  '<rect x="205" y="290" width="90" height="34" rx="8" fill="#DC2626"/>',
  '<rect x="505" y="290" width="90" height="34" rx="8" fill="#DC2626"/>',
  '<rect x="170" y="420" width="460" height="44" rx="14" fill="#1E293B"/>',
  '<rect x="205" y="460" width="76" height="64" rx="10" fill="#0F172A"/>',
  '<rect x="519" y="460" width="76" height="64" rx="10" fill="#0F172A"/>',
  '<rect x="322" y="368" width="156" height="44" rx="5" fill="#FFFFFF" stroke="#9F1239" stroke-width="3"/>',
  '<text x="400" y="399" font-family="Arial, sans-serif" font-size="24" font-weight="700" text-anchor="middle" fill="#9F1239">1-ABC-234</text>',
  '</svg>',
].join('');

const SAMPLE_PHOTO: PickedPhoto = {
  uri: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SAMPLE_PHOTO_SVG)}`,
  width: 800,
  height: 600,
};

/** The box over the plate in the sample photo, in normalised coordinates. */
const PLATE_REGION: PlateRegion = { x: 0.395, y: 0.6, width: 0.21, height: 0.09 };

/** Keeps the marked regions in state, so boxes can be drawn with the mouse like in the app. */
function InteractiveRedactor({ initialRegions }: { initialRegions: PlateRegion[] }) {
  const [regions, setRegions] = useState(initialRegions);
  return (
    <PlateRedactor
      photo={SAMPLE_PHOTO}
      regions={regions}
      onAddRegion={(region) => setRegions((current) => [...current, region])}
      testID="plate-redactor"
    />
  );
}

const meta: Meta<typeof PlateRedactor> = { title: 'Components/PlateRedactor', component: PlateRedactor };
export default meta;
type Story = StoryObj<typeof PlateRedactor>;

/** Drag over the plate to mark it. */
export const DrawBoxes: Story = { render: () => <InteractiveRedactor initialRegions={[]} /> };

export const PlateMarked: Story = {
  args: { photo: SAMPLE_PHOTO, regions: [PLATE_REGION], onAddRegion: () => {} },
};

export const NothingMarked: Story = {
  args: { photo: SAMPLE_PHOTO, regions: [], onAddRegion: () => {} },
};
