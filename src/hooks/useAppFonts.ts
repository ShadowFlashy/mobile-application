import { useFonts } from 'expo-font';
import { FONT_ASSETS } from '../theme/fonts';

/**
 * Loads the five direction A font faces: Barlow 400/500/600 and Barlow Condensed 500/600. It never blocks render: until the faces are
 * ready, text uses the fallback stack (web) or the system font (native). On the web the static
 * export also embeds the @font-face rules in the HTML.
 *
 * @returns true once every face is loaded (or failed, so the app never waits forever).
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts(FONT_ASSETS);
  return loaded || error !== null;
}
