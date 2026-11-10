import {
  collectionLiveries,
  CONTRAST_PAIRS,
  contrastRatio,
  darkColors,
  darkRarity,
  instruments,
  lightColors,
  lightRarity,
  liveries,
  relativeLuminance,
} from '../../../src/theme';
import type { RarityPalette, ThemeColors } from '../../../src/theme';

const AA = 4.5;

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

  it('matches the documented value of white on Redline Red (4.97:1)', () => {
    expect(ratio('#FFFFFF', '#E10600')).to.be.closeTo(4.97, 0.05);
  });

  it('refuses colours it cannot measure', () => {
    expect(relativeLuminance('rgba(0,0,0,0.5)')).to.equal(undefined);
    expect(contrastRatio('red', '#FFFFFF')).to.equal(undefined);
  });
});

const SCHEMES: [string, ThemeColors][] = [
  ['Paddock Paper (light)', lightColors],
  ['Night Session (dark)', darkColors],
];

describe('LIVERY text/background pairs (SPEC §7.2)', () => {
  it('checks the full documented list of pairs', () => {
    // 8 text tokens × 4 surfaces, 5 X-on-XSoft, 4 white-on-fill, inverse, 2 stage, signal.
    expect(CONTRAST_PAIRS).to.have.length(32 + 5 + 4 + 1 + 2 + 1);
  });

  SCHEMES.forEach(([name, colors]) => {
    it(`${name}: every pair is at least 4.5:1`, () => {
      const failures = CONTRAST_PAIRS.map(({ text, background }) => ({
        pair: `${text} on ${background}`,
        value: ratio(colors[text], colors[background]),
      })).filter(({ value }) => value < AA);
      expect(failures, JSON.stringify(failures)).to.deep.equal([]);
    });
  });

  it('keeps the documented lowest pairs above the line', () => {
    expect(ratio(lightColors.textSubtle, lightColors.surfaceSunken)).to.be.at.least(AA);
    expect(ratio(lightColors.accent, lightColors.surfaceMuted)).to.be.at.least(AA);
  });
});

describe('rarity chips, liveries and instruments', () => {
  const palettes: [string, RarityPalette][] = [
    ['light', lightRarity],
    ['dark', darkRarity],
  ];

  palettes.forEach(([name, palette]) => {
    it(`${name} rarity chips are at least 6.5:1`, () => {
      Object.values(palette).forEach(({ background, text }) => {
        expect(ratio(text, background), `${text} on ${background}`).to.be.at.least(6.5);
      });
    });
  });

  it('livery text on its page base is readable', () => {
    Object.entries(liveries).forEach(([page, { base, text }]) => {
      expect(ratio(text, base), page).to.be.at.least(AA);
    });
  });

  it('collection livery text on its set base is readable (Appendix E)', () => {
    Object.entries(collectionLiveries).forEach(([set, { base, text }]) => {
      expect(ratio(text, base), set).to.be.at.least(AA);
    });
  });

  it('pit board, roundel and timing colours carry readable text', () => {
    expect(ratio(instruments.pitBoardText, instruments.pitBoard)).to.be.at.least(AA);
    expect(ratio(instruments.pitBoardAccent, instruments.pitBoard)).to.be.at.least(AA);
    expect(ratio(instruments.roundelInk, instruments.roundel)).to.be.at.least(AA);
    expect(ratio('#FFFFFF', instruments.timingPurple)).to.be.at.least(AA);
    expect(ratio('#FFFFFF', instruments.timingGreen)).to.be.at.least(AA);
    expect(ratio(instruments.timingYellowInk, instruments.timingYellow)).to.be.at.least(AA);
  });
});
