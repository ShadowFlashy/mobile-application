import { useEffect } from 'react';
import { lines, useTheme } from '../theme';

const STYLE_ID = 'redline-focus-ring';

/**
 * Web: one keyboard focus ring for the whole app in the text colour of the active scheme (A's
 * active state), instead of the browser's own ring (orange or blue). Mouse and touch focus show no
 * ring. Browser APIs stay in this .web.ts file; native draws its own focus (useFocusRing.ts).
 */
export function useFocusRing(): void {
  const { colors } = useTheme();
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let style = document.getElementById(STYLE_ID);
    if (style === null) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent =
      `:focus-visible{outline:${lines.underline}px solid ${colors.text};outline-offset:${lines.underline}px}` +
      ':focus:not(:focus-visible){outline:none}';
  }, [colors.text]);
}
