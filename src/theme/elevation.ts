import type { ViewStyle } from 'react-native';

export type ElevationToken = 'flat' | 'raised' | 'sticker' | 'lifted' | 'floating';

/** Shadow colour of every elevation token (RNW turns shadow* into box-shadow). */
const SHADOW = '#000';

/** Cross-platform elevation styles (SPEC §7.5): shadow* props plus Android `elevation`. */
export const elevation: Record<ElevationToken, ViewStyle> = {
  flat: {},
  raised: {
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  sticker: {
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  lifted: {
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  floating: {
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
};
