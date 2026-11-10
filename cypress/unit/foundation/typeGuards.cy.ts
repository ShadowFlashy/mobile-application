import {
  isAlbumPageId,
  isBodyStyle,
  isCarCategory,
  isCountryCode,
  isIdentifiedBy,
  isOwnerVisibility,
  isPaintColor,
  isRarity,
  isRecord,
  isStringArray,
  isVerificationResult,
} from '../../../src/utils/typeGuards';

describe('type guards for database values', () => {
  it('recognises a known category', () => {
    expect(isCarCategory('jdm')).to.equal(true);
  });

  it('rejects an unknown category', () => {
    expect(isCarCategory('spaceship')).to.equal(false);
  });

  it('recognises a known rarity', () => {
    expect(isRarity('legendary')).to.equal(true);
  });

  it('rejects an unknown rarity', () => {
    expect(isRarity('mythic')).to.equal(false);
  });

  it('checks body styles and paint colours', () => {
    expect(isBodyStyle('wagon')).to.equal(true);
    expect(isBodyStyle('targa')).to.equal(false);
    expect(isPaintColor('gold')).to.equal(true);
    expect(isPaintColor('rainbow')).to.equal(false);
  });

  it('checks provenance, visibility and verification results', () => {
    expect(isIdentifiedBy('ai_edited')).to.equal(true);
    expect(isIdentifiedBy('robot')).to.equal(false);
    expect(isOwnerVisibility('vanity')).to.equal(true);
    expect(isOwnerVisibility('public')).to.equal(false);
    expect(isVerificationResult('plate_mismatch')).to.equal(true);
    expect(isVerificationResult('maybe')).to.equal(false);
  });

  it('checks album page ids', () => {
    expect(isAlbumPageId('wildcards')).to.equal(true);
    expect(isAlbumPageId('jdm-legends')).to.equal(false);
  });

  it('checks ISO alpha-2 country codes', () => {
    expect(isCountryCode('JP')).to.equal(true);
    expect(isCountryCode('jp')).to.equal(false);
    expect(isCountryCode('JPN')).to.equal(false);
  });

  it('never accepts non-strings', () => {
    for (const value of [undefined, null, 1, true, {}, []]) {
      expect(isCarCategory(value)).to.equal(false);
      expect(isPaintColor(value)).to.equal(false);
      expect(isCountryCode(value)).to.equal(false);
    }
  });

  it('recognises plain objects and string arrays', () => {
    expect(isRecord({ a: 1 })).to.equal(true);
    expect(isRecord([])).to.equal(false);
    expect(isRecord(null)).to.equal(false);
    expect(isStringArray(['a', 'b'])).to.equal(true);
    expect(isStringArray(['a', 1])).to.equal(false);
    expect(isStringArray('a')).to.equal(false);
  });
});
