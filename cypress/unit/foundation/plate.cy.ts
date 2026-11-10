import { isValidPlate, maskPlateHint, normalizePlate } from '../../../src/utils/plate';

describe('plate utils', () => {
  it('normalises dashes, spaces and lowercase letters', () => {
    expect(normalizePlate('1-abc 234')).to.equal('1ABC234');
  });

  it('treats differently formatted plates as the same plate', () => {
    expect(normalizePlate('1.ABC.234')).to.equal(normalizePlate('1abc234'));
  });

  it('accepts a Belgian plate', () => {
    expect(isValidPlate('1-ABC-234')).to.equal(true);
  });

  it('accepts a short vanity plate of two characters', () => {
    expect(isValidPlate('V8')).to.equal(true);
  });

  it('rejects a single character', () => {
    expect(isValidPlate('A')).to.equal(false);
  });

  it('rejects more than twelve letters or digits', () => {
    expect(isValidPlate('ABCDEFGHIJKLM')).to.equal(false);
  });

  it('rejects text without letters or digits', () => {
    expect(isValidPlate('--- ---')).to.equal(false);
  });

  it('masks everything except the hint', () => {
    expect(maskPlateHint('34')).to.equal('••••34');
  });
});
