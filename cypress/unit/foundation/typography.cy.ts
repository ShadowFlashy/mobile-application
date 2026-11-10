import {
  A_TEXT_VARIANTS,
  FONT_FAMILIES,
  LEGACY_TEXT_VARIANTS,
  LEGACY_VARIANT_MAP,
  MAX_FONT_SCALE,
  resolveVariant,
  TEXT_VARIANTS,
  textVariants,
  variantFamily,
} from '../../../src/theme';

const REGISTERED_FAMILIES: string[] = Object.values(FONT_FAMILIES);

describe('typography (direction A)', () => {
  it('loads exactly five upright faces: Barlow 400/500/600 and Barlow Condensed 500/600', () => {
    expect([...REGISTERED_FAMILIES].sort()).to.deep.equal([
      'BarlowCondensed_500Medium',
      'BarlowCondensed_600SemiBold',
      'Barlow_400Regular',
      'Barlow_500Medium',
      'Barlow_600SemiBold',
    ]);
    REGISTERED_FAMILIES.forEach((family) => expect(family).not.to.match(/Italic|700|800/));
  });

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

  it("has A's sizes, line heights and families", () => {
    const expected: Record<string, [number, number, string]> = {
      hero: [80, 72, 'BarlowCondensed_600SemiBold'],
      heroSub: [32, 36, 'BarlowCondensed_500Medium'],
      title: [34, 40, 'BarlowCondensed_600SemiBold'],
      unit: [20, 24, 'BarlowCondensed_500Medium'],
      num: [17, 20, 'BarlowCondensed_600SemiBold'],
      numS: [15, 20, 'BarlowCondensed_500Medium'],
      mark: [12, 12, 'BarlowCondensed_600SemiBold'],
      heading: [17, 24, 'Barlow_600SemiBold'],
      bodyL: [17, 24, 'Barlow_500Medium'],
      body: [15, 20, 'Barlow_500Medium'],
      value: [15, 20, 'Barlow_400Regular'],
      meta: [13, 18, 'Barlow_400Regular'],
      tab: [11, 14, 'Barlow_500Medium'],
      button: [17, 24, 'Barlow_600SemiBold'],
    };
    A_TEXT_VARIANTS.forEach((variant) => {
      const style = textVariants[variant];
      expect([style.fontSize, style.lineHeight, variantFamily(variant)], variant).to.deep.equal(expected[variant]);
    });
    expect(textVariants.hero.letterSpacing).to.equal(-1);
  });

  it('maps every deprecated LIVERY name onto an A variant with the same style', () => {
    LEGACY_TEXT_VARIANTS.forEach((legacy) => {
      const target = LEGACY_VARIANT_MAP[legacy];
      expect(resolveVariant(legacy), legacy).to.equal(target);
      expect(textVariants[legacy], legacy).to.deep.equal(textVariants[target]);
    });
    expect(resolveVariant('body')).to.equal('body');
  });

  it('never uppercases and uses tabular figures on every variant', () => {
    TEXT_VARIANTS.forEach((variant) => {
      expect(textVariants[variant].textTransform, variant).to.equal(undefined);
      expect(textVariants[variant].fontStyle, variant).to.equal(undefined);
      expect(textVariants[variant].fontVariant, variant).to.deep.equal(['tabular-nums']);
    });
  });

  it('caps font scaling on the big condensed styles and the fixed-width figures', () => {
    expect(MAX_FONT_SCALE).to.deep.equal({
      hero: 1.2,
      heroSub: 1.3,
      title: 1.3,
      display: 1.3,
      number: 1.3,
      num: 1.3,
      numS: 1.3,
      mark: 1,
      tab: 1.3,
    });
  });
});
