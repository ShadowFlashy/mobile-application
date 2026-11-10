/**
 * Direction A "Timing screen" colour tokens: black, white and one red, in two schemes.
 *
 * Six design tokens carry the whole look: `bg`, `raise`, `line`, `text`, `text2` and `red`. The rest
 * are derived from them. Rules:
 * - Red is a fill for the primary action only (the Spot key, "Add to album", primary buttons), never
 *   text. Labels on red use `onRed`.
 * - Active and selected states use `text`, never red.
 * - Success, warning and error are text plus an icon, never a colour.
 * - The light scheme is the same structure on pure white with neutral greys (never beige).
 *
 * Every component reads colours through `useTheme()`. `CONTRAST_PAIRS` lists every pair the app
 * promises; `cypress/unit/foundation/contrast.cy.ts` re-checks them in both schemes.
 */
export interface ThemeColors {
  // ── Direction A tokens ────────────────────────────────────────────────────────────────────
  /** Screen background. */
  bg: string;
  /** The only filled surface: disabled button, photo backdrop, inputs, skeletons. */
  raise: string;
  /** 1 px hairlines, progress tracks, the switch's off track. */
  line: string;
  /** Outline of a control that must be seen as a control (text fields, toasts): 3:1 on bg and raise. */
  field: string;
  /** Primary text, active and selected states, progress fill. */
  text: string;
  /** Secondary text, meta lines, inactive icons, radio and checkbox rings. */
  text2: string;
  /** The primary action only (fill). Never text. */
  red: string;
  /** Pressed state of a red fill. */
  redPressed: string;
  /** Labels and icons on red (white in both schemes, 4.97:1). */
  onRed: string;
  /** A text-colour fill: the Epic/Legendary roundel, count badges, a checked box, the on track. */
  inverse: string;
  /** Text and icons on `inverse` (the background colour). */
  onInverse: string;
  /** The plate-suggestion box on a photo: the text colour at 12 %. */
  plateFill: string;
  /** Car silhouettes of missing stickers (decorative, non-text). */
  silhouette: string;
  /** Modal scrim behind dialogs and sheets. */
  overlay: string;
  /** Always-dark photo stage (camera viewfinder, full-bleed photos); the same in both schemes. */
  stage: string;
  /** Text on the stage. */
  onStage: string;
  /** Secondary text on the stage. */
  onStageMuted: string;
}

/** The six design tokens of a scheme, plus the values that cannot be derived from them. */
interface SchemeTokens {
  bg: string;
  raise: string;
  line: string;
  field: string;
  text: string;
  text2: string;
  plateFill: string;
  silhouette: string;
  overlay: string;
}

const RED = '#E10600';
const RED_PRESSED = '#B80500';
const WHITE = '#FFFFFF';

/** The always-dark photo stage, identical in both schemes. */
const STAGE = { stage: '#0B0B0C', onStage: '#F5F5F7', onStageMuted: '#8E8E93' } as const;

function buildColors(tokens: SchemeTokens): ThemeColors {
  const { bg, raise, line, text, text2 } = tokens;
  return {
    bg,
    raise,
    line,
    field: tokens.field,
    text,
    text2,
    red: RED,
    redPressed: RED_PRESSED,
    onRed: WHITE,
    inverse: text,
    onInverse: bg,
    plateFill: tokens.plateFill,
    silhouette: tokens.silhouette,
    overlay: tokens.overlay,
    ...STAGE,
  };
}

/** Dark: the designed scheme (A-NOTES). */
export const darkColors: ThemeColors = buildColors({
  bg: '#0B0B0C',
  raise: '#161618',
  line: '#2A2A2E',
  field: '#6C6C72',
  text: '#F5F5F7',
  text2: '#8E8E93',
  plateFill: 'rgba(245,245,247,0.12)',
  silhouette: '#3A3A3E',
  overlay: 'rgba(0,0,0,0.72)',
});

/** Light: the same structure on pure white with neutral greys. */
export const lightColors: ThemeColors = buildColors({
  bg: '#FFFFFF',
  raise: '#F2F2F4',
  line: '#E3E3E8',
  field: '#8A8A90',
  text: '#0B0B0C',
  text2: '#6C6C72',
  plateFill: 'rgba(11,11,12,0.12)',
  silhouette: '#C7C7CC',
  overlay: 'rgba(11,11,12,0.48)',
});

/** Tokens that are used as text colours (see `TextTone` in typography.ts). */
export type TextColorToken = 'text' | 'text2' | 'onRed' | 'onInverse' | 'onStage' | 'onStageMuted';

/** Minimum contrast per pair: 4.5:1 for text, 3:1 for large text (24 px and up) and non-text indicators. */
export const AA_TEXT = 4.5;
export const AA_NON_TEXT = 3;

export interface ContrastPair {
  fg: keyof ThemeColors;
  bg: keyof ThemeColors;
  min: typeof AA_TEXT | typeof AA_NON_TEXT;
  /** What the pair is used for. */
  use: string;
}

/**
 * Every foreground/background pair direction A ships, with its minimum. Exported so the contrast
 * unit test checks exactly this list in both schemes.
 */
export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  { fg: 'text', bg: 'bg', min: AA_TEXT, use: 'primary text' },
  { fg: 'text', bg: 'raise', min: AA_TEXT, use: 'text in inputs and filled blocks' },
  { fg: 'text2', bg: 'bg', min: AA_TEXT, use: 'secondary text, meta lines' },
  { fg: 'text2', bg: 'raise', min: AA_TEXT, use: 'disabled button label, placeholders' },
  { fg: 'onRed', bg: 'red', min: AA_TEXT, use: 'primary button label, Spot key icon' },
  { fg: 'onRed', bg: 'redPressed', min: AA_TEXT, use: 'pressed primary button' },
  { fg: 'onInverse', bg: 'inverse', min: AA_TEXT, use: 'Epic/Legendary roundel letter, count badge digit' },
  { fg: 'onStage', bg: 'stage', min: AA_TEXT, use: 'text on the photo stage' },
  { fg: 'onStageMuted', bg: 'stage', min: AA_TEXT, use: 'secondary text on the photo stage' },
  { fg: 'red', bg: 'bg', min: AA_NON_TEXT, use: 'the Spot key and primary buttons against the screen' },
  { fg: 'text', bg: 'line', min: AA_NON_TEXT, use: 'progress fill on its track' },
  { fg: 'text2', bg: 'bg', min: AA_NON_TEXT, use: 'radio, checkbox and roundel rings, inactive icons' },
  { fg: 'text2', bg: 'line', min: AA_NON_TEXT, use: 'switch thumb on the off track' },
  { fg: 'onInverse', bg: 'inverse', min: AA_NON_TEXT, use: 'switch thumb on the on track' },
  { fg: 'inverse', bg: 'bg', min: AA_NON_TEXT, use: 'switch on track, checked box, Epic roundel' },
  { fg: 'field', bg: 'bg', min: AA_NON_TEXT, use: 'text field and toast outline against the screen' },
  { fg: 'field', bg: 'raise', min: AA_NON_TEXT, use: 'text field outline against its own fill' },
  { fg: 'onStage', bg: 'stage', min: AA_NON_TEXT, use: 'plate box: light line beside its dark inner line' },
];
