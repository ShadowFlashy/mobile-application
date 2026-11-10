import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { en, type Resources } from '../../i18n/resources';
import type { CollectionId } from '../../types/Collection';
import type { AlbumPageId } from '../../types/Progress';
import { isCollectionPage, type AnyAlbumPage } from '../../utils/album';

type CountryKey = keyof Resources['countries'];
type FunFactKey = keyof Resources['collections']['fun_facts'];

function isCountryKey(code: string): code is CountryKey {
  return Object.prototype.hasOwnProperty.call(en.countries, code);
}

function isFunFactKey(modelId: string): modelId is FunFactKey {
  return Object.prototype.hasOwnProperty.call(en.collections.fun_facts, modelId);
}

/** Translated labels of the album: page and set titles, countries and catalogue fun facts. */
export function useAlbumTitles() {
  const { t } = useTranslation();
  const pageTitle = useCallback(
    (id: AlbumPageId): string => (id === 'wildcards' ? t('album.wildcards_title') : t(`categories.${id}`)),
    [t],
  );
  const collectionTitle = useCallback((id: CollectionId): string => t(`collections.${id}.title`), [t]);
  const titleOf = useCallback(
    (page: AnyAlbumPage): string => (isCollectionPage(page) ? collectionTitle(page.collectionId) : pageTitle(page.id)),
    [pageTitle, collectionTitle],
  );
  /** "Germany"; an unknown code falls back to "Unknown". */
  const countryLabel = useCallback(
    (code: string): string => (isCountryKey(code) ? t(`countries.${code}`) : t('countries.XX')),
    [t],
  );
  /** The catalogue fun fact of a model (e.g. the Ferrari 308 GTSi), if there is one. */
  const funFact = useCallback(
    (modelId: string): string | undefined =>
      isFunFactKey(modelId) ? t(`collections.fun_facts.${modelId}`) : undefined,
    [t],
  );
  return { pageTitle, collectionTitle, titleOf, countryLabel, funFact };
}
