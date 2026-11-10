import { PLACES } from '../../../src/constants/places';

const MIGRATION = 'supabase/migrations/20261110110000_redline_v2_hardening.sql';

/** The labels of the `insert into private.places` list in the hardening migration. */
function sqlLabels(sql: string): string[] {
  const start = sql.indexOf('insert into private.places (label) values');
  const end = sql.indexOf('on conflict (label) do nothing', start);
  const block = sql.slice(start, end);
  return [...block.matchAll(/\('((?:[^']|'')*)'\)/g)].map((match) => (match[1] ?? '').replace(/''/g, "'"));
}

describe('hardening migration: the owner-snapshot gazetteer', () => {
  it('lists exactly every English and Dutch place name of the bundled gazetteer', () => {
    cy.readFile(MIGRATION).then((sql: string) => {
      const expected = [...new Set(PLACES.flatMap((place) => [place.nameEn, place.nameNl]))].sort();
      expect(sqlLabels(sql).sort()).to.deep.equal(expected);
    });
  });
});
