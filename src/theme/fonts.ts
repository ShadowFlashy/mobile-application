// src/theme/fonts.ts: imported ONLY by src/hooks/useAppFonts.ts. Never re-export it from
// src/theme/index.ts: its require('./x.ttf') breaks Vite in Storybook and Cypress, which load the
// same faces from fonts.css instead. Per-weight subpath imports keep unused weights out of the bundle.
// Direction A uses five upright faces: Barlow 400/500/600 and Barlow Condensed 500/600.
import { BarlowCondensed_500Medium } from '@expo-google-fonts/barlow-condensed/500Medium';
import { BarlowCondensed_600SemiBold } from '@expo-google-fonts/barlow-condensed/600SemiBold';
import { Barlow_400Regular } from '@expo-google-fonts/barlow/400Regular';
import { Barlow_500Medium } from '@expo-google-fonts/barlow/500Medium';
import { Barlow_600SemiBold } from '@expo-google-fonts/barlow/600SemiBold';

export const FONT_ASSETS = {
  BarlowCondensed_500Medium,
  BarlowCondensed_600SemiBold,
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
};
