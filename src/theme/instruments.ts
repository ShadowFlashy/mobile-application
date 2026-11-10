/**
 * Instrument tokens (SPEC §7.2): the motorsport dashboard parts, identical in both schemes.
 * LED "off" is `colors.surfaceSunken`; the tacho red zone is `colors.primary`.
 */
export interface InstrumentColors {
  ledGreen: string;
  ledRed: string;
  ledBlue: string;
  pitBoard: string;
  pitBoardText: string;
  pitBoardAccent: string;
  /** Roundel (a decal). */
  roundel: string;
  roundelInk: string;
  /** Timing purple (white text 7.1:1). */
  timingPurple: string;
  /** Streak and challenge green. */
  timingGreen: string;
  /** Duplicate yellow; ink is `timingYellowInk`. */
  timingYellow: string;
  timingYellowInk: string;
}

export const instruments: InstrumentColors = {
  ledGreen: '#22C55E',
  ledRed: '#E10600',
  ledBlue: '#3B82F6',
  pitBoard: '#121316',
  pitBoardText: '#F5F5F0',
  pitBoardAccent: '#FFD400',
  roundel: '#FFFFFF',
  roundelInk: '#15171C',
  timingPurple: '#7B2CBF',
  timingGreen: '#086A36',
  timingYellow: '#FFD400',
  timingYellowInk: '#111111',
};
