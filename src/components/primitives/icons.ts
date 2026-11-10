/**
 * Direction A's icon set: drawn on a 24 grid with a 1.75 stroke, round caps and joins, and no
 * fills (the Icon primitive strokes every shape in the current colour). Each icon is a list of
 * shapes: `d` is an SVG path, `c` a circle as [cx, cy, r].
 */
export interface IconShape {
  d?: string;
  c?: readonly [number, number, number];
}

const RING = { c: [12, 12, 8.5] } as const;

export const ICONS = {
  album: [
    {
      d: 'M12 6.5C10.2 5.2 7.6 4.6 4 4.8V18.3C7.6 18.1 10.2 18.7 12 20C13.8 18.7 16.4 18.1 20 18.3V4.8C16.4 4.6 13.8 5.2 12 6.5Z',
    },
    { d: 'M12 6.5V20' },
  ],
  stats: [{ d: 'M6 19V13' }, { d: 'M12 19V5' }, { d: 'M18 19V9' }],
  camera: [
    {
      d: 'M4 8.5C4 7.7 4.7 7 5.5 7H8L9.5 5H14.5L16 7H18.5C19.3 7 20 7.7 20 8.5V17.5C20 18.3 19.3 19 18.5 19H5.5C4.7 19 4 18.3 4 17.5V8.5Z',
    },
    { c: [12, 13, 3.25] },
  ],
  garage: [{ d: 'M3.5 19.5V9.5L12 4.5L20.5 9.5V19.5' }, { d: 'M7.5 19.5V12.5H16.5V19.5' }, { d: 'M7.5 16H16.5' }],
  profile: [{ c: [12, 8.5, 3.5] }, { d: 'M5 19.5C5.8 16.3 8.6 14.5 12 14.5C15.4 14.5 18.2 16.3 19 19.5' }],
  car: [
    {
      d: 'M3.5 15.5V13.2C3.5 12.5 4 11.9 4.7 11.8L7.5 11.3L9.8 8.6C10.2 8.2 10.7 8 11.2 8H15.3C15.9 8 16.4 8.3 16.8 8.8L18.6 11.3L19.6 11.6C20.2 11.8 20.5 12.3 20.5 12.9V15.5',
    },
    { d: 'M10 15.5H14' },
    { c: [7.75, 15.75, 2.25] },
    { c: [16.25, 15.75, 2.25] },
  ],
  close: [{ d: 'M6 6L18 18' }, { d: 'M18 6L6 18' }],
  check: [{ d: 'M5 12.5L9.5 17L19 7.5' }],
  'check-circle': [RING, { d: 'M8.5 12.25L11 14.75L15.75 9.75' }],
  plus: [{ d: 'M12 5V19' }, { d: 'M5 12H19' }],
  'plus-circle': [RING, { d: 'M12 8.5V15.5' }, { d: 'M8.5 12H15.5' }],
  minus: [{ d: 'M5 12H19' }],
  circle: [RING],
  'chevron-right': [{ d: 'M9.5 6L15.5 12L9.5 18' }],
  'chevron-left': [{ d: 'M14.5 6L8.5 12L14.5 18' }],
  'chevron-down': [{ d: 'M6 9.5L12 15.5L18 9.5' }],
  'chevron-up': [{ d: 'M6 14.5L12 8.5L18 14.5' }],
  'arrow-left': [{ d: 'M19 12H5' }, { d: 'M11 6L5 12L11 18' }],
  'arrow-right': [{ d: 'M5 12H19' }, { d: 'M13 6L19 12L13 18' }],
  search: [{ c: [10.5, 10.5, 6] }, { d: 'M15 15L20 20' }],
  alert: [RING, { d: 'M12 7.5V12.5' }, { d: 'M12 16.25V16.3' }],
  info: [RING, { d: 'M12 11V16.5' }, { d: 'M12 7.75V7.8' }],
  warning: [{ d: 'M12 4L21 19.5H3L12 4Z' }, { d: 'M12 10V14' }, { d: 'M12 17V17.05' }],
  help: [
    RING,
    { d: 'M9.75 9.5C9.75 8.25 10.75 7.25 12 7.25C13.25 7.25 14.25 8.25 14.25 9.5C14.25 10.75 13 11.25 12 12V13' },
    { d: 'M12 16.5V16.55' },
  ],
  offline: [
    {
      d: 'M7 18.5H17C19.2 18.5 21 16.7 21 14.5C21 12.4 19.4 10.7 17.4 10.5C16.9 7.9 14.7 6 12 6C9.4 6 7.2 7.8 6.6 10.3C4.6 10.7 3 12.4 3 14.5C3 16.7 4.8 18.5 7 18.5Z',
    },
    { d: 'M4 4L20 20' },
  ],
  location: [
    { d: 'M12 21C12 21 18.5 15 18.5 10C18.5 6.4 15.6 3.5 12 3.5C8.4 3.5 5.5 6.4 5.5 10C5.5 15 12 21 12 21Z' },
    { c: [12, 10, 2.5] },
  ],
  locate: [{ c: [12, 12, 6] }, { d: 'M12 3V6' }, { d: 'M12 18V21' }, { d: 'M3 12H6' }, { d: 'M18 12H21' }],
  calendar: [
    {
      d: 'M6.5 5.5H17.5C18.3 5.5 19 6.2 19 7V18C19 18.8 18.3 19.5 17.5 19.5H6.5C5.7 19.5 5 18.8 5 18V7C5 6.2 5.7 5.5 6.5 5.5Z',
    },
    { d: 'M5 10H19' },
    { d: 'M9 3.5V7' },
    { d: 'M15 3.5V7' },
  ],
  clock: [RING, { d: 'M12 7.5V12L15 14' }],
  trash: [
    { d: 'M5 7H19' },
    { d: 'M10 4H14' },
    { d: 'M7 7L8 19.5H16L17 7' },
    { d: 'M10.5 10.5V16' },
    { d: 'M13.5 10.5V16' },
  ],
  edit: [{ d: 'M15.5 5L19 8.5L9 18.5H5.5V15L15.5 5Z' }, { d: 'M13.5 7L17 10.5' }],
  refresh: [
    { d: 'M19.5 12C19.5 16.1 16.1 19.5 12 19.5C8.6 19.5 5.8 17.3 4.9 14.2' },
    { d: 'M4.5 12C4.5 7.9 7.9 4.5 12 4.5C15.4 4.5 18.2 6.7 19.1 9.8' },
    { d: 'M19.5 5.5V10H15' },
    { d: 'M4.5 18.5V14H9' },
  ],
  eye: [
    { d: 'M2.5 12C4.5 8 8 5.75 12 5.75C16 5.75 19.5 8 21.5 12C19.5 16 16 18.25 12 18.25C8 18.25 4.5 16 2.5 12Z' },
    { c: [12, 12, 3] },
  ],
  'eye-off': [
    { d: 'M2.5 12C4.5 8 8 5.75 12 5.75C16 5.75 19.5 8 21.5 12C19.5 16 16 18.25 12 18.25C8 18.25 4.5 16 2.5 12Z' },
    { c: [12, 12, 3] },
    { d: 'M4 4L20 20' },
  ],
  shield: [
    { d: 'M12 3.5L19 6.5V11.5C19 15.6 16.1 19.1 12 20.5C7.9 19.1 5 15.6 5 11.5V6.5L12 3.5Z' },
    { d: 'M9 12L11 14L15 10' },
  ],
  lock: [
    {
      d: 'M7 10.5H17C17.8 10.5 18.5 11.2 18.5 12V18.5C18.5 19.3 17.8 20 17 20H7C6.2 20 5.5 19.3 5.5 18.5V12C5.5 11.2 6.2 10.5 7 10.5Z',
    },
    { d: 'M8.5 10.5V7.5C8.5 5.6 10.1 4 12 4C13.9 4 15.5 5.6 15.5 7.5V10.5' },
  ],
  key: [{ c: [8, 15.5, 3.5] }, { d: 'M10.5 13L19 4.5' }, { d: 'M16 7.5L18.5 10' }, { d: 'M13.5 10L15.5 12' }],
  mail: [
    {
      d: 'M5.5 6H18.5C19.3 6 20 6.7 20 7.5V16.5C20 17.3 19.3 18 18.5 18H5.5C4.7 18 4 17.3 4 16.5V7.5C4 6.7 4.7 6 5.5 6Z',
    },
    { d: 'M4.5 7L12 12.5L19.5 7' },
  ],
  bell: [
    { d: 'M6 16.5V11C6 7.7 8.7 5 12 5C15.3 5 18 7.7 18 11V16.5L19.5 18H4.5L6 16.5Z' },
    { d: 'M10 20.5C10.4 21.1 11.1 21.5 12 21.5C12.9 21.5 13.6 21.1 14 20.5' },
  ],
  flag: [{ d: 'M5.5 21V4.5' }, { d: 'M5.5 5H17L15 9L17 13H5.5' }],
  settings: [
    { d: 'M4 7H13' },
    { d: 'M18 7H20' },
    { c: [15.5, 7, 2.25] },
    { d: 'M4 17H6' },
    { d: 'M11 17H20' },
    { c: [8.5, 17, 2.25] },
  ],
  logout: [
    { d: 'M10 4.5H6C5.2 4.5 4.5 5.2 4.5 6V18C4.5 18.8 5.2 19.5 6 19.5H10' },
    { d: 'M14.5 8L18.5 12L14.5 16' },
    { d: 'M18.5 12H9.5' },
  ],
  globe: [
    RING,
    { d: 'M3.5 12H20.5' },
    {
      d: 'M12 3.5C14.2 5.8 15.3 8.8 15.3 12C15.3 15.2 14.2 18.2 12 20.5C9.8 18.2 8.7 15.2 8.7 12C8.7 8.8 9.8 5.8 12 3.5Z',
    },
  ],
  image: [
    { d: 'M6 5H18C18.6 5 19 5.4 19 6V18C19 18.6 18.6 19 18 19H6C5.4 19 5 18.6 5 18V6C5 5.4 5.4 5 6 5Z' },
    { c: [9.5, 9.5, 1.5] },
    { d: 'M5 16L9.5 12L13 15L15.5 13L19 16' },
  ],
  images: [
    { d: 'M8 4.5H18.5C19.1 4.5 19.5 4.9 19.5 5.5V16' },
    {
      d: 'M5.5 8H15C15.6 8 16 8.4 16 9V18.5C16 19.1 15.6 19.5 15 19.5H5.5C4.9 19.5 4.5 19.1 4.5 18.5V9C4.5 8.4 4.9 8 5.5 8Z',
    },
    { d: 'M4.5 16.5L8 13.5L11 16L13 14.5L16 16.5' },
  ],
  sparkle: [
    {
      d: 'M12 4L13.6 9.4C13.8 10 14.2 10.4 14.8 10.6L20 12L14.8 13.4C14.2 13.6 13.8 14 13.6 14.6L12 20L10.4 14.6C10.2 14 9.8 13.6 9.2 13.4L4 12L9.2 10.6C9.8 10.4 10.2 10 10.4 9.4L12 4Z',
    },
  ],
  paint: [{ d: 'M12 3.5C12 3.5 6 10 6 14C6 17.3 8.7 20 12 20C15.3 20 18 17.3 18 14C18 10 12 3.5 12 3.5Z' }],
  trophy: [
    { d: 'M8 4.5H16V10C16 12.2 14.2 14 12 14C9.8 14 8 12.2 8 10V4.5Z' },
    { d: 'M8 6.5H5.5V8C5.5 9.7 6.6 11 8.2 11.3' },
    { d: 'M16 6.5H18.5V8C18.5 9.7 17.4 11 15.8 11.3' },
    { d: 'M12 14V17.5' },
    { d: 'M8.5 19.5H15.5' },
  ],
  flame: [
    {
      d: 'M12 20.5C15.3 20.5 18 18 18 14.6C18 11 15.5 8.8 14 6.5C13.6 8.4 12.6 9.5 11.4 10.2C11.4 7.8 10.6 5.4 8.8 3.5C8.6 6.6 6 9.4 6 14.2C6 17.8 8.7 20.5 12 20.5Z',
    },
  ],
  star: [{ d: 'M12 4L14.4 9L19.8 9.6L15.8 13.3L16.9 18.7L12 16L7.1 18.7L8.2 13.3L4.2 9.6L9.6 9L12 4Z' }],
  layers: [{ d: 'M12 4.5L20.5 9L12 13.5L3.5 9L12 4.5Z' }, { d: 'M3.5 13L12 17.5L20.5 13' }],
  document: [
    { d: 'M14 3.5H7C6.2 3.5 5.5 4.2 5.5 5V19C5.5 19.8 6.2 20.5 7 20.5H17C17.8 20.5 18.5 19.8 18.5 19V8L14 3.5Z' },
    { d: 'M14 3.5V8H18.5' },
    { d: 'M9 12.5H15' },
    { d: 'M9 16H15' },
  ],
  compass: [RING, { d: 'M15 9L13.2 13.2L9 15L10.8 10.8L15 9Z' }],
  tools: [
    {
      d: 'M14.5 4.5C12.6 4.5 11 6.1 11 8C11 8.5 11.1 9 11.3 9.4L4.5 16.2C3.9 16.8 3.9 17.7 4.5 18.3L5.7 19.5C6.3 20.1 7.2 20.1 7.8 19.5L14.6 12.7C15 12.9 15.5 13 16 13C17.9 13 19.5 11.4 19.5 9.5L17.3 11.7L14.3 9.7L12.3 6.7L14.5 4.5Z',
    },
  ],
  swap: [{ d: 'M4.5 8.5H19' }, { d: 'M15.5 5L19 8.5L15.5 12' }, { d: 'M19.5 15.5H5' }, { d: 'M8.5 12L5 15.5L8.5 19' }],
  skip: [{ d: 'M6 6L14 12L6 18V6Z' }, { d: 'M18 6V18' }],
  copy: [
    { d: 'M10 9H18C18.6 9 19 9.4 19 10V18C19 18.6 18.6 19 18 19H10C9.4 19 9 18.6 9 18V10C9 9.4 9.4 9 10 9Z' },
    { d: 'M15 9V6C15 5.4 14.6 5 14 5H6C5.4 5 5 5.4 5 6V14C5 14.6 5.4 15 6 15H9' },
  ],
  building: [
    { d: 'M5 20.5V5.5C5 4.7 5.7 4 6.5 4H13.5C14.3 4 15 4.7 15 5.5V20.5' },
    { d: 'M15 9.5H17.5C18.3 9.5 19 10.2 19 11V20.5' },
    { d: 'M3.5 20.5H20.5' },
    { d: 'M8.5 8H11.5' },
    { d: 'M8.5 12H11.5' },
    { d: 'M8.5 16H11.5' },
  ],
  share: [
    { d: 'M12 15V4' },
    { d: 'M8 7.5L12 3.5L16 7.5' },
    {
      d: 'M7 11H5.5C4.7 11 4 11.7 4 12.5V19C4 19.8 4.7 20.5 5.5 20.5H18.5C19.3 20.5 20 19.8 20 19V12.5C20 11.7 19.3 11 18.5 11H17',
    },
  ],
  download: [{ d: 'M12 4V15' }, { d: 'M8 11L12 15L16 11' }, { d: 'M5 19.5H19' }],
  triangle: [{ d: 'M12 4.5L20.5 19H3.5L12 4.5Z' }],
  pause: [RING, { d: 'M10 9V15' }, { d: 'M14 9V15' }],
  card: [
    {
      d: 'M5.5 6H18.5C19.3 6 20 6.7 20 7.5V16.5C20 17.3 19.3 18 18.5 18H5.5C4.7 18 4 17.3 4 16.5V7.5C4 6.7 4.7 6 5.5 6Z',
    },
    { c: [9, 11, 1.75] },
    { d: 'M6.5 15C7 14 7.9 13.5 9 13.5C10.1 13.5 11 14 11.5 15' },
    { d: 'M14 10H17' },
    { d: 'M14 13.5H17' },
  ],
  phone: [
    {
      d: 'M8.5 3.5H15.5C16.3 3.5 17 4.2 17 5V19C17 19.8 16.3 20.5 15.5 20.5H8.5C7.7 20.5 7 19.8 7 19V5C7 4.2 7.7 3.5 8.5 3.5Z',
    },
    { d: 'M11 17.5H13' },
  ],
  power: [
    { d: 'M12 4V12' },
    {
      d: 'M7.5 7.5C6.3 8.7 5.5 10.3 5.5 12C5.5 15.6 8.4 18.5 12 18.5C15.6 18.5 18.5 15.6 18.5 12C18.5 10.3 17.7 8.7 16.5 7.5',
    },
  ],
  more: [{ d: 'M6 12V12.05' }, { d: 'M12 12V12.05' }, { d: 'M18 12V12.05' }],
  'radio-on': [RING, { c: [12, 12, 3.5] }],
  bolt: [{ d: 'M13 3L5 13.5H11L10 21L19 9.5H13L13 3Z' }],
  sun: [
    { c: [12, 12, 4] },
    { d: 'M12 3V5' },
    { d: 'M12 19V21' },
    { d: 'M3 12H5' },
    { d: 'M19 12H21' },
    { d: 'M5.6 5.6L7 7' },
    { d: 'M17 17L18.4 18.4' },
    { d: 'M5.6 18.4L7 17' },
    { d: 'M17 7L18.4 5.6' },
  ],
  battery: [
    { d: 'M5 8H17C17.6 8 18 8.4 18 9V15C18 15.6 17.6 16 17 16H5C4.4 16 4 15.6 4 15V9C4 8.4 4.4 8 5 8Z' },
    { d: 'M20.5 10.5V13.5' },
    { d: 'M11.5 9.5L9.5 12H12.5L10.5 14.5' },
  ],
  medal: [{ c: [12, 9, 5] }, { d: 'M9 13.5L7.5 21L12 18.5L16.5 21L15 13.5' }],
  dumbbell: [{ d: 'M6.5 8V16' }, { d: 'M17.5 8V16' }, { d: 'M4 10V14' }, { d: 'M20 10V14' }, { d: 'M6.5 12H17.5' }],
} as const satisfies Record<string, readonly IconShape[]>;

export type AIconName = keyof typeof ICONS;

/**
 * @deprecated Ionicons names used by LIVERY code, each mapped to the A icon that replaces it. Kept so
 * old call sites compile and already render A icons; new code uses the A names.
 */
export const LEGACY_ICON_NAMES = {
  add: 'plus',
  'add-circle-outline': 'plus-circle',
  'barbell-outline': 'dumbbell',
  'battery-charging-outline': 'battery',
  'flash-outline': 'bolt',
  'radio-button-off': 'circle',
  'radio-button-on': 'radio-on',
  'ribbon-outline': 'medal',
  'rocket-outline': 'flame',
  'shield-half-outline': 'shield',
  'shield-outline': 'shield',
  'sunny-outline': 'sun',
  albums: 'album',
  'albums-outline': 'album',
  'alert-circle': 'alert',
  'alert-circle-outline': 'alert',
  'arrow-back': 'arrow-left',
  'book-outline': 'album',
  'business-outline': 'building',
  'calendar-outline': 'calendar',
  'camera-outline': 'camera',
  'car-outline': 'car',
  'car-sport': 'car',
  'car-sport-outline': 'car',
  checkmark: 'check',
  'checkmark-circle': 'check-circle',
  'chevron-back': 'chevron-left',
  'chevron-forward': 'chevron-right',
  'cloud-offline-outline': 'offline',
  'color-palette-outline': 'paint',
  'compass-outline': 'compass',
  'construct-outline': 'tools',
  'copy-outline': 'copy',
  'create-outline': 'edit',
  'document-text-outline': 'document',
  'ellipse-outline': 'circle',
  'eye-off-outline': 'eye-off',
  'eye-outline': 'eye',
  'flag-outline': 'flag',
  'flame-outline': 'flame',
  'globe-outline': 'globe',
  'help-circle-outline': 'help',
  'hourglass-outline': 'clock',
  'id-card-outline': 'card',
  'images-outline': 'images',
  'information-circle-outline': 'info',
  'key-outline': 'key',
  'language-outline': 'globe',
  'layers-outline': 'layers',
  'location-outline': 'location',
  'log-out-outline': 'logout',
  'mail-unread-outline': 'mail',
  'notifications-outline': 'bell',
  'pause-circle-outline': 'pause',
  person: 'profile',
  'person-circle': 'profile',
  'person-circle-outline': 'profile',
  'person-outline': 'profile',
  'phone-portrait-outline': 'phone',
  'play-skip-forward': 'skip',
  'power-outline': 'power',
  'search-outline': 'search',
  'settings-outline': 'settings',
  'shield-checkmark': 'shield',
  'shield-checkmark-outline': 'shield',
  shuffle: 'swap',
  sparkles: 'sparkle',
  'sparkles-outline': 'sparkle',
  speedometer: 'stats',
  'speedometer-outline': 'stats',
  'star-outline': 'star',
  'swap-horizontal': 'swap',
  'time-outline': 'clock',
  'timer-outline': 'clock',
  'trash-outline': 'trash',
  'triangle-outline': 'triangle',
  'trophy-outline': 'trophy',
  'warning-outline': 'warning',
} as const satisfies Record<string, AIconName>;

export type LegacyIconName = keyof typeof LEGACY_ICON_NAMES;

/** Every name the Icon primitive accepts: A names, plus the deprecated Ionicons names. */
export type IconName = AIconName | LegacyIconName;

/** True for a deprecated Ionicons name. */
export function isLegacyIconName(name: IconName): name is LegacyIconName {
  return Object.prototype.hasOwnProperty.call(LEGACY_ICON_NAMES, name);
}

/** The A icon a name resolves to. */
export function resolveIcon(name: IconName): AIconName {
  return isLegacyIconName(name) ? LEGACY_ICON_NAMES[name] : name;
}

/** Every A icon name, e.g. for the Storybook gallery and the component test. */
export const A_ICON_NAMES: readonly AIconName[] = [
  'album',
  'stats',
  'camera',
  'garage',
  'profile',
  'car',
  'close',
  'check',
  'check-circle',
  'plus',
  'plus-circle',
  'minus',
  'circle',
  'chevron-right',
  'chevron-left',
  'chevron-down',
  'chevron-up',
  'arrow-left',
  'arrow-right',
  'search',
  'alert',
  'info',
  'warning',
  'help',
  'offline',
  'location',
  'locate',
  'calendar',
  'clock',
  'trash',
  'edit',
  'refresh',
  'eye',
  'eye-off',
  'shield',
  'lock',
  'key',
  'mail',
  'bell',
  'flag',
  'settings',
  'logout',
  'globe',
  'image',
  'images',
  'sparkle',
  'paint',
  'trophy',
  'flame',
  'star',
  'layers',
  'document',
  'compass',
  'tools',
  'swap',
  'skip',
  'copy',
  'building',
  'share',
  'download',
  'triangle',
  'pause',
  'card',
  'phone',
  'power',
  'more',
  'radio-on',
  'bolt',
  'sun',
  'battery',
  'medal',
  'dumbbell',
];
