import { isCarCategory, isRarity } from '../../src/utils/typeGuards';

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
});
