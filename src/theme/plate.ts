/** Licence / vanity plate colours (SPEC §7.2), moved out of VanityPlate. */
export interface PlateColors {
  background: string;
  ink: string;
  /** The blue EU band. */
  band: string;
  bandInk: string;
  border: string;
}

export const plate: PlateColors = {
  background: '#FFFFFF',
  ink: '#9F1239',
  band: '#1D4ED8',
  bandInk: '#FFD400',
  border: '#15171C',
};
