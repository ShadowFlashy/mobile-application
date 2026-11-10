import { FONT_FAMILIES, MAX_FONT_SCALE, TEXT_VARIANTS, textVariants, variantFamily } from '../../../src/theme';

const REGISTERED_FAMILIES: string[] = Object.values(FONT_FAMILIES);

describe('typography (SPEC §7.3)', () => {
  it('defines every variant', () => {
    expect(Object.keys(textVariants).sort()).to.deep.equal([...TEXT_VARIANTS].sort());
  });

  it('never sets fontWeight: Android ignores the weight of custom families', () => {
    TEXT_VARIANTS.forEach((variant) => {
      expect(textVariants[variant], variant).not.to.have.property('fontWeight');
    });
  });

  it('uses one of the five loaded families, with a web fallback stack', () => {
    TEXT_VARIANTS.forEach((variant) => {
      const family = variantFamily(variant);
      expect(REGISTERED_FAMILIES, variant).to.include(family);
      // Component tests run on react-native-web: the family is "<Name>, <fallbacks>".
      expect(textVariants[variant].fontFamily, variant).to.match(new RegExp(`^${family}, .*sans-serif$`));
    });
  });

  it('has the documented sizes and line heights', () => {
    const expected: Record<string, [number, number]> = {
      hero: [44, 44],
      display: [34, 36],
      title: [24, 28],
      headline: [18, 24],
      body: [16, 24],
      bodyStrong: [16, 24],
      bodySm: [14, 20],
      label: [13, 16],
      caption: [12, 16],
      number: [28, 30],
      numberSm: [17, 20],
      stickerNo: [15, 16],
    };
    TEXT_VARIANTS.forEach((variant) => {
      const style = textVariants[variant];
      expect([style.fontSize, style.lineHeight], variant).to.deep.equal(expected[variant]);
    });
  });

  it('uppercases the livery headlines and labels, and uses tabular numbers', () => {
    (['hero', 'display', 'title', 'label'] as const).forEach((variant) => {
      expect(textVariants[variant].textTransform, variant).to.equal('uppercase');
    });
    expect(textVariants.number.fontVariant).to.deep.equal(['tabular-nums']);
    expect(textVariants.numberSm.fontVariant).to.deep.equal(['tabular-nums']);
    expect(textVariants.body.textTransform).to.equal(undefined);
  });

  it('caps font scaling at 1.4 on hero, display and title only', () => {
    expect(MAX_FONT_SCALE).to.deep.equal({ hero: 1.4, display: 1.4, title: 1.4 });
  });
});
