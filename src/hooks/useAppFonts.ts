import { useFonts } from 'expo-font';
import { FONT_ASSETS } from '../theme/fonts';

/**
 * Loads the five LIVERY font faces (SPEC §7.3). It never blocks render: until the faces are
 * ready, text uses the fallback stack (web) or the system font (native). On the web the static
 * export also embeds the @font-face rules in the HTML.
 *
 * @returns true once every face is loaded (or failed, so the app never waits forever).
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts(FONT_ASSETS);
  return loaded || error !== null;
}
