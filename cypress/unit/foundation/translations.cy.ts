import { en, nl } from '../../../src/i18n/resources';

/** Flattens nested translation objects into "namespace.key" paths. */
function keysOf(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keysOf(child, prefix ? `${prefix}.${key}` : key));
}

/** Every text with its path. */
function entriesOf(value: unknown, prefix = ''): [string, string][] {
  if (typeof value === 'string') return [[prefix, value]];
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) => entriesOf(child, prefix ? `${prefix}.${key}` : key));
}

/** The {{placeholders}} of a text, sorted, so "{{count}} of {{total}}" equals "{{total}}: {{count}}". */
function placeholdersOf(text: string): string[] {
  return [...text.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)].map((match) => match[1] ?? '').sort();
}

// Course ch. 20: a test that checks every translation key exists in every language.
describe('translations (namespaced)', () => {
  it('has the same namespaces in English and Dutch', () => {
    expect(Object.keys(nl).sort()).to.deep.equal(Object.keys(en).sort());
  });

  it('has every English key in Dutch', () => {
    const dutch = new Set(keysOf(nl));
    expect(keysOf(en).filter((key) => !dutch.has(key))).to.deep.equal([]);
  });

  it('has no Dutch keys that English does not have', () => {
    const english = new Set(keysOf(en));
    expect(keysOf(nl).filter((key) => !english.has(key))).to.deep.equal([]);
  });

  it('has no empty English texts', () => {
    expect(entriesOf(en).filter(([, text]) => text.trim().length === 0)).to.deep.equal([]);
  });

  it('has no empty Dutch texts', () => {
    expect(entriesOf(nl).filter(([, text]) => text.trim().length === 0)).to.deep.equal([]);
  });

  it('uses the same {{placeholders}} in English and Dutch', () => {
    const dutch = new Map(entriesOf(nl));
    const mismatches = entriesOf(en)
      .filter(([key, text]) => {
        const other = dutch.get(key);
        return other !== undefined && placeholdersOf(text).join(',') !== placeholdersOf(other).join(',');
      })
      .map(([key]) => key);
    expect(mismatches).to.deep.equal([]);
  });

  it('labels every paint colour, body style and catalogue country', () => {
    expect(Object.keys(en.paint)).to.have.length(14);
    expect(Object.keys(en.body_style)).to.have.length(10);
    expect(en.countries).to.include.keys(['DE', 'GB', 'IT', 'FR', 'SE', 'JP', 'US', 'HR', 'XX']);
  });
});
