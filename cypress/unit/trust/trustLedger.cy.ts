import type { Spot } from '../../../src/types/Spot';
import { buildTrustLedger } from '../../../src/utils/trustLedger';

function spot(id: string, city?: string): Spot {
  return {
    id,
    userId: 'u1',
    make: 'Porsche',
    model: '911 GT3',
    photoPath: `u1/${id}.jpg`,
    city,
    spottedAt: '2026-11-01T10:00:00Z',
    createdAt: '2026-11-01T10:00:00Z',
    paint: 'blue',
    bodyStyle: 'coupe',
    platesHidden: 1,
    identifiedBy: 'ai',
    shareNameWithOwner: false,
  };
}

// "What Redline stores" (SPEC P0-18).
describe('buildTrustLedger', () => {
  it('counts photos and distinct cities, and always reports 0 plates and 0 GPS points', () => {
    const spots = [spot('a', 'Leuven'), spot('b', 'leuven '), spot('c', 'Antwerpen'), spot('d'), spot('e', '  ')];
    expect(buildTrustLedger(spots, { remaining: 12, dailyLimit: 15 })).to.deep.equal({
      photos: 5,
      plates: 0,
      gpsPoints: 0,
      cities: 2,
      aiCallsLeft: 12,
      aiDailyLimit: 15,
    });
  });

  it('is empty while the spots load and leaves the quota unknown without one', () => {
    expect(buildTrustLedger(undefined)).to.deep.equal({
      photos: 0,
      plates: 0,
      gpsPoints: 0,
      cities: 0,
      aiCallsLeft: undefined,
      aiDailyLimit: undefined,
    });
  });

  it('keeps the scans left inside 0..limit', () => {
    expect(buildTrustLedger([], { remaining: -3, dailyLimit: 15 }).aiCallsLeft).to.equal(0);
    expect(buildTrustLedger([], { remaining: 99, dailyLimit: 15 }).aiCallsLeft).to.equal(15);
  });
});
