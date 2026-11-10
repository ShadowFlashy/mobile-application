import {
  BODY_STYLES as FUNCTION_BODY_STYLES,
  CAR_COLORS,
} from '../../../supabase/functions/identify-car/identification';
import { AI_MAX_SIDE, CONFIDENCE_LIKELY, CONFIDENCE_SURE, IDENTIFY_DAILY_LIMIT } from '../../../src/constants/ai';
import { ALBUM_PAGES } from '../../../src/constants/albumPages';
import { queryKeys } from '../../../src/constants/queryKeys';
import { DAY, HOUR, MINUTE, SECOND, WEEK } from '../../../src/constants/time';
import { BODY_STYLES, CAR_CATEGORIES, PAINT_COLORS } from '../../../src/types/CarModel';
import { ALBUM_PAGE_IDS } from '../../../src/types/Progress';

// The app adapts to the deployed, frozen identify-car function (SPEC §9): its enums are the contract.
describe('shared contracts', () => {
  it('uses exactly the body styles of the identify-car function', () => {
    expect([...BODY_STYLES]).to.deep.equal([...FUNCTION_BODY_STYLES]);
  });

  it('uses exactly the paint colours of the identify-car function', () => {
    expect([...PAINT_COLORS]).to.deep.equal([...CAR_COLORS]);
  });

  it('matches the deployed limits', () => {
    expect(AI_MAX_SIDE).to.equal(768);
    expect(IDENTIFY_DAILY_LIMIT).to.equal(15);
    expect(CONFIDENCE_SURE).to.be.greaterThan(CONFIDENCE_LIKELY);
  });

  it('defines the album pages in print order: 8 categories, then Wildcards', () => {
    expect(ALBUM_PAGES.map((page) => page.id)).to.deep.equal([...ALBUM_PAGE_IDS]);
    expect(ALBUM_PAGES.map((page) => page.number)).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(ALBUM_PAGES.flatMap((page) => (page.category !== undefined ? [page.category] : []))).to.deep.equal([
      ...CAR_CATEGORIES,
    ]);
    expect(ALBUM_PAGES[8]?.category).to.equal(undefined);
  });

  it('keeps the time constants consistent', () => {
    expect(MINUTE).to.equal(60 * SECOND);
    expect(HOUR).to.equal(60 * MINUTE);
    expect(DAY).to.equal(24 * HOUR);
    expect(WEEK).to.equal(7 * DAY);
  });

  it('builds distinct query keys per user', () => {
    expect(queryKeys.mySpots('a')).to.deep.equal(['spots', 'a']);
    expect(queryKeys.mySpots('a')).not.to.deep.equal(queryKeys.mySpots('b'));
    expect(queryKeys.collections()).to.deep.equal(['collections']);
    expect(queryKeys.spotShowcase('s')[0]).not.to.equal(queryKeys.spot('s')[0]);
  });
});
