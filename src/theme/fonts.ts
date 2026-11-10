// src/theme/fonts.ts: imported ONLY by src/hooks/useAppFonts.ts. Never re-export it from
// src/theme/index.ts: its require('./x.ttf') breaks Vite in Storybook and Cypress, which load the
// same faces from fonts.css instead. Per-weight subpath imports keep unused weights out of the bundle.
import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed/700Bold';
import { BarlowCondensed_800ExtraBold_Italic } from '@expo-google-fonts/barlow-condensed/800ExtraBold_Italic';
import { Barlow_400Regular } from '@expo-google-fonts/barlow/400Regular';
import { Barlow_500Medium } from '@expo-google-fonts/barlow/500Medium';
import { Barlow_700Bold } from '@expo-google-fonts/barlow/700Bold';

export const FONT_ASSETS = {
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold_Italic,
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_700Bold,
};
