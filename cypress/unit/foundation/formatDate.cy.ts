import { formatDate, formatRelativeDate } from '../../../src/utils/formatDate';

const now = new Date('2026-11-09T12:00:00Z');

describe('date formatting', () => {
  it('formats a date in English', () => {
    expect(formatDate('2026-11-09T12:00:00Z', 'en-GB')).to.equal('9 Nov 2026');
  });

  it('formats a date in Dutch', () => {
    expect(formatDate('2026-11-09T12:00:00Z', 'nl')).to.equal('9 nov 2026');
  });

  it('describes a spot from a few minutes ago', () => {
    expect(formatRelativeDate('2026-11-09T11:55:00Z', 'en', now)).to.equal('5 minutes ago');
  });

  it('describes yesterday in Dutch', () => {
    expect(formatRelativeDate('2026-11-08T11:00:00Z', 'nl', now)).to.equal('gisteren');
  });

  it('falls back to the date after a week', () => {
    expect(formatRelativeDate('2026-10-01T12:00:00Z', 'en-GB', now)).to.equal('1 Oct 2026');
  });

  it('returns an empty string for an invalid date', () => {
    expect(formatRelativeDate('not a date', 'en', now)).to.equal('');
  });
});
