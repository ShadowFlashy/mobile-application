import { dHashFromGray, findDuplicate, grayFromRgba, hammingDistance } from '../../../src/utils/photoHash';
import type { Spot } from '../../../src/types/Spot';

// Duplicate-photo guard (SPEC P0-21): dHash of a 9×8 grayscale thumbnail + Hamming distance.
function rows(make: (row: number, column: number) => number): number[] {
  const gray: number[] = [];
  for (let row = 0; row < 8; row += 1) for (let column = 0; column < 9; column += 1) gray.push(make(row, column));
  return gray;
}

function spot(id: string, photoHash?: string): Spot {
  return {
    id,
    userId: 'user',
    make: 'Porsche',
    model: '911',
    photoPath: `user/${id}.jpg`,
    spottedAt: '2026-11-01T10:00:00.000Z',
    createdAt: '2026-11-01T10:00:00.000Z',
    paint: 'red',
    bodyStyle: 'coupe',
    platesHidden: 1,
    identifiedBy: 'manual',
    shareNameWithOwner: false,
    photoHash,
  };
}

describe('dHashFromGray', () => {
  it('gives 16 hex chars: 0 bits for brightening rows, 1 bits for darkening rows', () => {
    expect(dHashFromGray(rows((_row, column) => column * 10))).to.equal('0000000000000000');
    expect(dHashFromGray(rows((_row, column) => 255 - column * 10))).to.equal('ffffffffffffffff');
    expect(dHashFromGray(rows((row, column) => (row === 0 ? 100 - column : column)))).to.equal('ff00000000000000');
  });

  it('is stable under a uniform brightness change', () => {
    const base = rows((row, column) => ((row * 37 + column * 91) % 200) + 10);
    expect(dHashFromGray(base.map((value) => value + 30))).to.equal(dHashFromGray(base));
    expect(dHashFromGray(base)).to.match(/^[0-9a-f]{16}$/);
  });

  it('treats missing or non-finite values as 0', () => {
    expect(dHashFromGray([])).to.equal('0000000000000000');
    expect(dHashFromGray([Number.NaN, Number.POSITIVE_INFINITY])).to.equal('0000000000000000');
    // 5 vs a missing neighbour (0) is a "darker to the right" step: the second bit is set.
    expect(dHashFromGray([0, 5])).to.equal('4000000000000000');
  });
});

describe('grayFromRgba', () => {
  it('converts RGBA pixels with luma weights and ignores alpha', () => {
    const gray = grayFromRgba([255, 255, 255, 0, 0, 0, 0, 255, 255, 0, 0, 255]);
    expect(gray).to.have.length(3);
    expect(gray[0]).to.be.closeTo(255, 1e-9);
    expect(gray[1]).to.equal(0);
    expect(gray[2]).to.be.closeTo(76.245, 1e-9);
  });
});

describe('hammingDistance', () => {
  it('counts differing bits', () => {
    expect(hammingDistance('ffffffffffffffff', '0000000000000000')).to.equal(64);
    expect(hammingDistance('0123456789abcdef', '0123456789abcdef')).to.equal(0);
    expect(hammingDistance('0f', '0e')).to.equal(1);
    expect(hammingDistance('AB', 'ab')).to.equal(0);
    expect(hammingDistance('ff', 'ffff')).to.equal(8);
  });
});

describe('findDuplicate', () => {
  it('returns the closest spot within 6 bits and ignores spots without a hash', () => {
    const spots = [
      spot('far', 'ffffffffffffffff'),
      spot('none'),
      spot('five-off', '000000000000001f'),
      spot('two-off', '0000000000000003'),
    ];
    expect(findDuplicate(spots, '0000000000000000')?.id).to.equal('two-off');
    expect(findDuplicate(spots, '0000000000000000', 1)).to.equal(undefined);
    expect(findDuplicate([spot('seven-off', '000000000000007f')], '0000000000000000')).to.equal(undefined);
    expect(findDuplicate([], '0000000000000000')).to.equal(undefined);
  });
});
