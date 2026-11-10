import type { Coordinates } from '../types/Location';

/**
 * Minimal, defensive EXIF reader for the auto-fill (SPEC P0-02, D-7). It runs on the device only:
 * the photo's capture moment pre-fills the date, and its GPS position is matched against the bundled
 * gazetteer and then discarded. Never throws: garbage, truncated or hostile bytes give `{}`.
 *
 * JPEG → APP1 "Exif\0\0" → TIFF header (II or MM) → IFD0 → ExifIFD (0x8769: DateTimeOriginal
 * 0x9003, OffsetTimeOriginal 0x9011) and GPS IFD (0x8825: refs 0x0001/0x0003, rationals 0x0002/0x0004).
 */
export interface ExifData {
  /** DateTimeOriginal as an ISO string. */
  takenAt?: string;
  /** GPS position; read on the device only and never stored or sent. */
  gps?: Coordinates;
}

const TAG_EXIF_IFD = 0x8769;
const TAG_GPS_IFD = 0x8825;
const TAG_DATE_TIME_ORIGINAL = 0x9003;
const TAG_OFFSET_TIME_ORIGINAL = 0x9011;
const TAG_GPS_LATITUDE_REF = 0x0001;
const TAG_GPS_LATITUDE = 0x0002;
const TAG_GPS_LONGITUDE_REF = 0x0003;
const TAG_GPS_LONGITUDE = 0x0004;

const TYPE_ASCII = 2;
const TYPE_SHORT = 3;
const TYPE_LONG = 4;
const TYPE_RATIONAL = 5;
/** Byte size per component of each TIFF field type (index = type). */
const TYPE_SIZES = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
/** Hostile files could declare thousands of entries; real IFDs have a few dozen. */
const MAX_ENTRIES = 512;

interface TiffEntry {
  tag: number;
  type: number;
  count: number;
  /** Absolute offset of the value bytes in the buffer. */
  valueOffset: number;
}

interface Tiff {
  view: DataView;
  /** Absolute offset of the TIFF header. */
  start: number;
  little: boolean;
}

function readIfd(tiff: Tiff, ifdOffset: number): Map<number, TiffEntry> {
  const entries = new Map<number, TiffEntry>();
  const { view, start, little } = tiff;
  const base = start + ifdOffset;
  if (ifdOffset < 8 || base + 2 > view.byteLength) return entries;
  const total = Math.min(view.getUint16(base, little), MAX_ENTRIES);
  for (let index = 0; index < total; index += 1) {
    const entry = base + 2 + index * 12;
    if (entry + 12 > view.byteLength) break;
    const tag = view.getUint16(entry, little);
    const type = view.getUint16(entry + 2, little);
    const count = view.getUint32(entry + 4, little);
    const size = (TYPE_SIZES[type] ?? 0) * count;
    if (size === 0) continue;
    // Values of up to 4 bytes sit inside the entry; bigger ones are at an offset from the TIFF start.
    const valueOffset = size <= 4 ? entry + 8 : start + view.getUint32(entry + 8, little);
    if (valueOffset + size > view.byteLength) continue;
    entries.set(tag, { tag, type, count, valueOffset });
  }
  return entries;
}

function readPointer(tiff: Tiff, entry: TiffEntry | undefined): number | undefined {
  if (entry === undefined || entry.count < 1) return undefined;
  if (entry.type === TYPE_LONG) return tiff.view.getUint32(entry.valueOffset, tiff.little);
  if (entry.type === TYPE_SHORT) return tiff.view.getUint16(entry.valueOffset, tiff.little);
  return undefined;
}

function readAscii(tiff: Tiff, entry: TiffEntry | undefined): string | undefined {
  if (entry === undefined || entry.type !== TYPE_ASCII) return undefined;
  let text = '';
  for (let index = 0; index < entry.count; index += 1) {
    const code = tiff.view.getUint8(entry.valueOffset + index);
    if (code === 0) break;
    text += String.fromCharCode(code);
  }
  return text.trim();
}

function readRationals(tiff: Tiff, entry: TiffEntry | undefined, count: number): number[] | undefined {
  if (entry === undefined || entry.type !== TYPE_RATIONAL || entry.count < count) return undefined;
  const values: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const offset = entry.valueOffset + index * 8;
    const numerator = tiff.view.getUint32(offset, tiff.little);
    const denominator = tiff.view.getUint32(offset + 4, tiff.little);
    if (denominator === 0) return undefined;
    values.push(numerator / denominator);
  }
  return values;
}

/** "YYYY:MM:DD HH:MM:SS" (+ optional "+01:00") → ISO string. Without an offset the device's zone is used. */
export function exifDateToIso(dateTime: string, offset?: string): string | undefined {
  const match = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(dateTime);
  if (match === null) return undefined;
  const [year, month, day, hour, minute, second] = match.slice(1).map(Number);
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    hour === undefined ||
    minute === undefined ||
    second === undefined
  ) {
    return undefined;
  }
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  if (hour > 23 || minute > 59 || second > 59) return undefined;
  // Rejects impossible dates such as 31 February (Date would silently roll them over).
  if (new Date(Date.UTC(year, month - 1, day)).getUTCDate() !== day) return undefined;

  const offsetMatch = offset === undefined ? null : /^([+-])(\d{2}):(\d{2})$/.exec(offset);
  let time: number;
  if (offsetMatch !== null) {
    const sign = offsetMatch[1] === '-' ? -1 : 1;
    const offsetMinutes = sign * (Number(offsetMatch[2]) * 60 + Number(offsetMatch[3]));
    time = Date.UTC(year, month - 1, day, hour, minute, second) - offsetMinutes * 60_000;
  } else {
    time = new Date(year, month - 1, day, hour, minute, second).getTime();
  }
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

function readCoordinate(tiff: Tiff, gps: Map<number, TiffEntry>, refTag: number, valueTag: number): number | undefined {
  const parts = readRationals(tiff, gps.get(valueTag), 3);
  const ref = readAscii(tiff, gps.get(refTag))?.toUpperCase();
  if (parts === undefined || ref === undefined) return undefined;
  const [degrees = 0, minutes = 0, seconds = 0] = parts;
  const value = degrees + minutes / 60 + seconds / 3600;
  if (ref === 'S' || ref === 'W') return -value;
  if (ref === 'N' || ref === 'E') return value;
  return undefined;
}

function readGps(tiff: Tiff, ifd0: Map<number, TiffEntry>): Coordinates | undefined {
  const pointer = readPointer(tiff, ifd0.get(TAG_GPS_IFD));
  if (pointer === undefined) return undefined;
  const gps = readIfd(tiff, pointer);
  const latitude = readCoordinate(tiff, gps, TAG_GPS_LATITUDE_REF, TAG_GPS_LATITUDE);
  const longitude = readCoordinate(tiff, gps, TAG_GPS_LONGITUDE_REF, TAG_GPS_LONGITUDE);
  if (latitude === undefined || longitude === undefined) return undefined;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return undefined;
  // Cameras without a fix often write 0/0 ("null island"): that is no position.
  if (latitude === 0 && longitude === 0) return undefined;
  return { latitude, longitude };
}

function readTakenAt(tiff: Tiff, ifd0: Map<number, TiffEntry>): string | undefined {
  const pointer = readPointer(tiff, ifd0.get(TAG_EXIF_IFD));
  if (pointer === undefined) return undefined;
  const exif = readIfd(tiff, pointer);
  const dateTime = readAscii(tiff, exif.get(TAG_DATE_TIME_ORIGINAL));
  if (dateTime === undefined) return undefined;
  return exifDateToIso(dateTime, readAscii(tiff, exif.get(TAG_OFFSET_TIME_ORIGINAL)));
}

/** Absolute offset of the TIFF header inside the first APP1 Exif segment, if any. */
function findTiffStart(view: DataView): number | undefined {
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return undefined;
  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) return undefined;
    const marker = view.getUint8(offset + 1);
    if (marker === 0xff) {
      offset += 1; // fill byte
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2; // markers without a length
      continue;
    }
    if (marker === 0xda || marker === 0xd9) return undefined; // image data starts: no more metadata
    const length = view.getUint16(offset + 2);
    if (length < 2) return undefined;
    const isExif =
      marker === 0xe1 &&
      length >= 16 &&
      offset + 10 <= view.byteLength &&
      view.getUint32(offset + 4) === 0x45786966 && // "Exif"
      view.getUint16(offset + 8) === 0x0000;
    if (isExif) return offset + 10;
    offset += 2 + length;
  }
  return undefined;
}

/** Reads DateTimeOriginal and GPS from JPEG bytes. Anything unreadable is simply left out. */
export function readExif(bytes: Uint8Array): ExifData {
  try {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const start = findTiffStart(view);
    if (start === undefined || start + 8 > view.byteLength) return {};
    const byteOrder = view.getUint16(start);
    if (byteOrder !== 0x4949 && byteOrder !== 0x4d4d) return {};
    const little = byteOrder === 0x4949;
    if (view.getUint16(start + 2, little) !== 42) return {};
    const tiff: Tiff = { view, start, little };
    const ifd0 = readIfd(tiff, view.getUint32(start + 4, little));

    const result: ExifData = {};
    const takenAt = readTakenAt(tiff, ifd0);
    if (takenAt !== undefined) result.takenAt = takenAt;
    const gps = readGps(tiff, ifd0);
    if (gps !== undefined) result.gps = gps;
    return result;
  } catch {
    return {};
  }
}
