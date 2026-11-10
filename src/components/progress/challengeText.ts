import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { en, type Resources } from '../../i18n/resources';
import { COLLECTION_IDS, type CollectionId } from '../../types/Collection';
import type { ChallengeSlot, WeeklyChallenge } from '../../types/Progress';

type CountryKey = keyof Resources['countries'];

function isCountryKey(value: string | undefined): value is CountryKey {
  return value !== undefined && Object.prototype.hasOwnProperty.call(en.countries, value);
}

function isCollectionId(value: string | undefined): value is CollectionId {
  return COLLECTION_IDS.some((id) => id === value);
}

/** Translated pit-board texts: the challenge description and the slot label. */
export function useChallengeText(): {
  describe: (challenge: WeeklyChallenge) => string;
  slotLabel: (slot: ChallengeSlot) => string;
} {
  const { t } = useTranslation();

  const describe = useCallback(
    (challenge: WeeklyChallenge): string => {
      const count = challenge.target;
      const { params } = challenge;
      switch (challenge.template) {
        case 'spots':
          return t('challenges.spots', { count });
        case 'notes':
          return t('challenges.notes', { count });
        case 'wildcard':
          return t('challenges.wildcard', { count });
        case 'new_stickers':
          return t('challenges.new_stickers', { count });
        case 'category':
          return t('challenges.category', {
            count,
            category: params.category === undefined ? '' : t(`categories.${params.category}`),
          });
        case 'distinct_pages':
          return t('challenges.distinct_pages', { count });
        case 'paint':
          return t('challenges.paint', {
            count,
            paint: params.paint === undefined ? '' : t(`paint.${params.paint}`).toLocaleLowerCase(),
          });
        case 'country':
          return t('challenges.country', {
            count,
            country: isCountryKey(params.country) ? t(`countries.${params.country}`) : (params.country ?? ''),
          });
        case 'rarity_min':
          return t('challenges.rarity_min', {
            count,
            rarity: t(`rarity.${params.rarity ?? 'epic'}`).toLocaleLowerCase(),
          });
        case 'same_make':
          return t('challenges.same_make', { count });
        case 'collection':
          return t('challenges.collection', {
            count,
            set: isCollectionId(params.collection)
              ? t(`collections.${params.collection}.title`)
              : (params.collection ?? ''),
          });
      }
    },
    [t],
  );

  const slotLabel = useCallback(
    (slot: ChallengeSlot): string => {
      switch (slot) {
        case 'warmup':
          return t('challenges.slot_warmup');
        case 'main':
          return t('challenges.slot_main');
        case 'stretch':
          return t('challenges.slot_stretch');
      }
    },
    [t],
  );

  return { describe, slotLabel };
}
