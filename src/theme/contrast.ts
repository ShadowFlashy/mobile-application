/**
 * WCAG 2.x contrast helpers (pure). Used by the contrast unit test to prove every documented
 * foreground/background pair of direction A reaches its minimum (4.5:1 text, 3:1 non-text).
 */
function channel(value: number): number {
  const srgb = value / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance of a `#RGB` or `#RRGGBB` colour; undefined for anything else. */
export function relativeLuminance(hex: string): number | undefined {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (match === null) return undefined;
  const digits = match[1] ?? '';
  const full =
    digits.length === 3
      ? digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : digits;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two opaque hex colours (1–21); undefined when either is not a hex colour. */
export function contrastRatio(foreground: string, background: string): number | undefined {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  if (a === undefined || b === undefined) return undefined;
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}
