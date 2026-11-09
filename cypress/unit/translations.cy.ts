import en from '../../src/i18n/locales/en.json';
import nl from '../../src/i18n/locales/nl.json';

/** Flattens nested translation objects into "namespace.key" paths. */
function keysOf(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keysOf(child, prefix ? `${prefix}.${key}` : key));
}

function valuesOf(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];
  return Object.values(value).flatMap(valuesOf);
}

// Course ch. 20: a test that checks every translation key exists in every language.
describe('translations', () => {
  it('has every English key in Dutch', () => {
    const missing = keysOf(en).filter((key) => !keysOf(nl).includes(key));
    expect(missing).to.deep.equal([]);
  });

  it('has no Dutch keys that English does not have', () => {
    const extra = keysOf(nl).filter((key) => !keysOf(en).includes(key));
    expect(extra).to.deep.equal([]);
  });

  it('has no empty English texts', () => {
    expect(valuesOf(en).filter((text) => text.trim().length === 0)).to.deep.equal([]);
  });

  it('has no empty Dutch texts', () => {
    expect(valuesOf(nl).filter((text) => text.trim().length === 0)).to.deep.equal([]);
  });
});
