/**
 * Direction A space, radii, lines and touch targets (A-NOTES "Space, radii, lines, icons").
 * A 4-pt rhythm, one 20 px left edge (`spacing.gutter`), 24 between sections, a 36 px section
 * heading row and row pitches of 40, 44 or 56.
 */
export const spacing = {
  none: 0,
  /** @deprecated Off the 4-pt rhythm; use `xs`. */
  xxs: 2,
  xs: 4,
  sm: 8,
  smd: 12,
  md: 16,
  /** The side margin of every screen: the single 20 px left edge. */
  gutter: 20,
  /** The gap between sections. */
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Fixed heights of A's rows (row pitch) and the section heading row. */
export const rowHeights = {
  /** Compact rows: challenges. */
  compact: 40,
  /** Default rows: page table, details, single-line radio rows. */
  default: 44,
  /** Two-line rows: timing tower, car rows, switch rows. */
  tall: 56,
  /** The section heading row (title left, meta or action right, on one baseline). */
  sectionHeading: 36,
  /** The screen header row under the status bar. */
  screenHeader: 44,
} as const;

/**
 * Corner radii: 0 for rows and bars, 8 for photos, buttons, inputs and dialogs, 10 for the Spot key,
 * full for the roundel, badges and the switch. Nothing is rounder than 8 except those.
 */
export const radii = {
  none: 0,
  /** The plate box on a photo. */
  xs: 2,
  /** Skeleton blocks and small marks. */
  sm: 4,
  /** Photos, buttons, inputs, dialogs, sheets, toasts. */
  md: 8,
  /** The Spot key in the tab bar. */
  key: 10,
  /** Roundels, badges, the switch. */
  pill: 999,
  /** @deprecated LIVERY radius; capped at 8. */
  lg: 8,
  /** @deprecated LIVERY radius; capped at 8. */
  xl: 8,
  /** @deprecated LIVERY sticker radius; use `md`. */
  sticker: 8,
  /** @deprecated LIVERY sticker radius; use `md`. */
  stickerInner: 8,
} as const;

/** Line weights: 1 px hairlines between rows, 2 px progress lines and active-tab underlines. */
export const lines = {
  hairline: 1,
  /** Radio, checkbox and roundel rings. */
  ring: 1.5,
  progress: 2,
  underline: 2,
} as const;

/** @deprecated LIVERY border weights; use `lines`. */
export const borders = {
  hairline: 1,
  strong: 2,
  stickerEdge: 1,
  focus: 2,
} as const;

/** Minimum touch target in dp: every interactive element is at least 44 × 44. */
export const touchTarget = 44;

/**
 * Column widths of A's timing rows, shared so the figures line up from list to list. Figure columns
 * use them as a minimum width: at a large font size a column grows instead of truncating "#118".
 */
export const columns = {
  /** Album page number ("05"). */
  page: 28,
  /** Step number of a numbered list ("1"). */
  step: 24,
  /** Sticker number in a timing row ("#118"). */
  number: 32,
  /** Sticker number on an album page ("#118" in the larger figure). */
  sticker: 36,
  /** Count on the right ("2/3", "12/12"). */
  count: 48,
  /** Points on the right ("+250 XP"). */
  xp: 72,
  /** Date over the rarity roundel on the right of a timing row. */
  trailing: 64,
  /** Thumbnail of a row (72 × 30). */
  thumb: 72,
  /** The short progress line of a progress row. */
  bar: 72,
  /** The progress line of the album's page table. */
  tableBar: 96,
} as const;

/** Fixed photo aspect ratios, so the layout never shifts while photos load. */
export const aspect = {
  photo: 4 / 3,
  feed: 4 / 5,
  hero: 16 / 10,
  /** The timing-tower thumbnail (72 × 30). */
  thumb: 72 / 30,
} as const;

/** Icon sizes on A's 24 grid. */
export const iconSizes = { sm: 16, md: 20, lg: 24 } as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radii;
