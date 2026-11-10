import type { PaintColor } from '../types/CarModel';

/** Paint swatches (SPEC §7.2). `other` is rendered with a "?" glyph by PaintSwatch. */
export const paint: Record<PaintColor, string> = {
  black: '#111111',
  white: '#F5F5F5',
  silver: '#C0C4C8',
  grey: '#6B7078',
  red: '#C8102E',
  blue: '#1F4FD8',
  green: '#1E7B45',
  yellow: '#F2C200',
  orange: '#F47B20',
  brown: '#6E4B2A',
  beige: '#D8C8A8',
  purple: '#6A3FA0',
  gold: '#C9A227',
  other: '#9AA0A6',
};
