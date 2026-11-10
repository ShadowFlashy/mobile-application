import {
  AA_NON_TEXT,
  AA_TEXT,
  CONTRAST_PAIRS,
  contrastRatio,
  darkColors,
  darkTheme,
  lightColors,
  lightTheme,
  relativeLuminance,
  roundels,
} from '../../../src/theme';
import type { ThemeColors } from '../../../src/theme';

function ratio(foreground: string, background: string): number {
  const value = contrastRatio(foreground, background);
  if (value === undefined) throw new Error(`Not an opaque hex colour: ${foreground} on ${background}`);
  return value;
}

describe('contrastRatio (WCAG 2.x)', () => {
  it('gives 21:1 for black on white and 1:1 for equal colours', () => {
    expect(ratio('#000000', '#FFFFFF')).to.be.closeTo(21, 0.01);
    expect(ratio('#FFFFFF', '#000')).to.be.closeTo(21, 0.01);
    expect(ratio('#E10600', '#E10600')).to.equal(1);
  });

  it('matches the documented value of white on Redline red (4.97:1)', () => {
    expect(ratio('#FFFFFF', '#E10600')).to.be.closeTo(4.97, 0.05);
  });

  it('refuses colours it cannot measure', () => {
    expect(relativeLuminance('rgba(0,0,0,0.5)')).to.equal(undefined);
    expect(contrastRatio('red', '#FFFFFF')).to.equal(undefined);
  });
});

const SCHEMES: [string, ThemeColors][] = [
  ['light', lightColors],
  ['dark', darkColors],
];

describe('direction A colour pairs', () => {
  it('lists every pair A ships, with a 4.5:1 or 3:1 minimum and its use', () => {
    expect(CONTRAST_PAIRS.length).to.be.at.least(12);
    CONTRAST_PAIRS.forEach(({ fg, bg, min, use }) => {
      expect([AA_TEXT, AA_NON_TEXT], `${fg} on ${bg}`).to.include(min);
      expect(use.length, `${fg} on ${bg}`).to.be.greaterThan(0);
    });
    // Text pairs are held to 4.5:1: text and text-2 on both surfaces, labels on red.
    const textPairs = CONTRAST_PAIRS.filter(({ min }) => min === AA_TEXT).map(({ fg, bg }) => `${fg}/${bg}`);
    expect(textPairs).to.include.members(['text/bg', 'text/raise', 'text2/bg', 'text2/raise', 'onRed/red']);
  });

  SCHEMES.forEach(([name, colors]) => {
    it(`${name}: every pair reaches its minimum`, () => {
      const failures = CONTRAST_PAIRS.map(({ fg, bg, min }) => ({
        pair: `${fg} on ${bg}`,
        value: ratio(colors[fg], colors[bg]),
        min,
      })).filter(({ value, min }) => value < min);
      expect(failures, JSON.stringify(failures)).to.deep.equal([]);
    });
  });

  it('documents the measured values of A-NOTES', () => {
    expect(ratio(darkColors.text, darkColors.bg)).to.be.closeTo(18.1, 0.1);
    expect(ratio(darkColors.text2, darkColors.bg)).to.be.closeTo(6.0, 0.1);
    expect(ratio(darkColors.text2, darkColors.raise)).to.be.closeTo(5.5, 0.1);
    expect(ratio(lightColors.text2, lightColors.bg)).to.be.at.least(5.2);
    expect(ratio(lightColors.text2, lightColors.raise)).to.be.at.least(AA_TEXT);
  });
});

describe('direction A palette rules', () => {
  SCHEMES.forEach(([name, colors]) => {
    it(`${name}: red is the only accent; every other colour token is a neutral grey`, () => {
      expect(colors.red).to.equal('#E10600');
      expect(colors.onRed).to.equal('#FFFFFF');
      Object.entries(colors)
        .filter(([token]) => token !== 'red' && token !== 'redPressed')
        .forEach(([token, value]) => {
          const hex = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i.exec(value);
          const rgba = /^rgba\((\d+),(\d+),(\d+),[\d.]+\)$/.exec(value);
          const channels = hex
            ? [hex[1], hex[2], hex[3]].map((part) => parseInt(part ?? '', 16))
            : rgba
              ? [rgba[1], rgba[2], rgba[3]].map((part) => Number(part))
              : undefined;
          expect(channels, `${token} is a hex or rgba colour`).not.to.equal(undefined);
          const spread = Math.max(...(channels ?? [])) - Math.min(...(channels ?? []));
          expect(spread, token).to.be.at.most(8);
        });
    });

    it(`${name}: greys are neutral (no warm paper, no beige)`, () => {
      (['bg', 'raise', 'line', 'text', 'text2'] as const).forEach((token) => {
        const hex = colors[token];
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        // Neutral or cool: blue is never lower than red, and the channels stay within 8 of each other.
        expect(b, token).to.be.at.least(r);
        expect(Math.max(r, g, b) - Math.min(r, g, b), token).to.be.at.most(8);
      });
    });
  });

  it('keeps the light scheme on pure white', () => {
    expect(lightColors.bg).to.equal('#FFFFFF');
  });
});

describe('rarity roundels and the deprecated decorative sets', () => {
  [lightTheme, darkTheme].forEach((theme) => {
    it(`${theme.scheme}: every roundel letter is readable on its disc or on the background`, () => {
      Object.entries(roundels).forEach(([rarity, style]) => {
        const background = style.fill !== undefined ? theme.colors[style.fill] : theme.colors.bg;
        expect(ratio(theme.colors[style.ink], background), rarity).to.be.at.least(AA_TEXT);
        if (style.ring !== undefined) {
          expect(ratio(theme.colors[style.ring], theme.colors.bg), `${rarity} ring`).to.be.at.least(AA_NON_TEXT);
        }
      });
    });
  });
});
