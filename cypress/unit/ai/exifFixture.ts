/**
 * Builds synthetic EXIF data for the W3 unit tests: a TIFF block with IFD0, an Exif IFD
 * (DateTimeOriginal, OffsetTimeOriginal) and a GPS IFD, wrapped in a JPEG APP1 segment.
 */
export interface ExifFixture {
  dateTimeOriginal?: string;
  offsetTimeOriginal?: string;
  gps?: { latitude: number; longitude: number };
  littleEndian?: boolean;
}

type Entry =
  | { tag: number; kind: 'ascii'; text: string }
  | { tag: number; kind: 'long'; value: number }
  | { tag: number; kind: 'rational'; values: [number, number][] };

const TYPE_ASCII = 2;
const TYPE_LONG = 4;
const TYPE_RATIONAL = 5;

function toDms(value: number): [number, number][] {
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60 * 10000);
  return [
    [degrees, 1],
    [minutes, 1],
    [seconds, 10000],
  ];
}

function ifdSize(entries: Entry[]): number {
  return 2 + entries.length * 12 + 4;
}

function dataSize(entry: Entry): number {
  if (entry.kind === 'ascii') return entry.text.length + 1;
  if (entry.kind === 'rational') return entry.values.length * 8;
  return 4;
}

/** A TIFF block (as found after "Exif\0\0") with the requested tags. */
export function buildTiff(fixture: ExifFixture): Uint8Array {
  const little = fixture.littleEndian ?? true;
  const exifEntries: Entry[] = [];
  if (fixture.dateTimeOriginal !== undefined) {
    exifEntries.push({ tag: 0x9003, kind: 'ascii', text: fixture.dateTimeOriginal });
  }
  if (fixture.offsetTimeOriginal !== undefined) {
    exifEntries.push({ tag: 0x9011, kind: 'ascii', text: fixture.offsetTimeOriginal });
  }
  const gpsEntries: Entry[] = [];
  if (fixture.gps !== undefined) {
    gpsEntries.push({ tag: 0x0001, kind: 'ascii', text: fixture.gps.latitude < 0 ? 'S' : 'N' });
    gpsEntries.push({ tag: 0x0002, kind: 'rational', values: toDms(fixture.gps.latitude) });
    gpsEntries.push({ tag: 0x0003, kind: 'ascii', text: fixture.gps.longitude < 0 ? 'W' : 'E' });
    gpsEntries.push({ tag: 0x0004, kind: 'rational', values: toDms(fixture.gps.longitude) });
  }

  // Layout: header, IFD0, Exif IFD, GPS IFD, then the out-of-line values.
  const ifd0: Entry[] = [{ tag: 0x010f, kind: 'ascii', text: 'Redline Test Camera' }];
  const ifd0Offset = 8;
  const ifd0Count = 1 + (exifEntries.length > 0 ? 1 : 0) + (gpsEntries.length > 0 ? 1 : 0);
  const exifOffset = ifd0Offset + 2 + ifd0Count * 12 + 4;
  if (exifEntries.length > 0) ifd0.push({ tag: 0x8769, kind: 'long', value: exifOffset });
  const gpsOffset = exifOffset + (exifEntries.length > 0 ? ifdSize(exifEntries) : 0);
  if (gpsEntries.length > 0) ifd0.push({ tag: 0x8825, kind: 'long', value: gpsOffset });
  let dataOffset = gpsOffset + (gpsEntries.length > 0 ? ifdSize(gpsEntries) : 0);

  const all = [...ifd0, ...exifEntries, ...gpsEntries];
  const total = dataOffset + all.reduce((sum, entry) => sum + (dataSize(entry) > 4 ? dataSize(entry) : 0), 0);
  const bytes = new Uint8Array(total);
  const view = new DataView(bytes.buffer);

  view.setUint16(0, little ? 0x4949 : 0x4d4d);
  view.setUint16(2, 42, little);
  view.setUint32(4, ifd0Offset, little);

  const writeValue = (at: number, entry: Entry) => {
    if (entry.kind === 'ascii') {
      for (let index = 0; index < entry.text.length; index += 1)
        view.setUint8(at + index, entry.text.charCodeAt(index));
      view.setUint8(at + entry.text.length, 0);
    } else if (entry.kind === 'long') {
      view.setUint32(at, entry.value, little);
    } else {
      entry.values.forEach(([numerator, denominator], index) => {
        view.setUint32(at + index * 8, numerator, little);
        view.setUint32(at + index * 8 + 4, denominator, little);
      });
    }
  };

  const writeIfd = (offset: number, entries: Entry[]) => {
    view.setUint16(offset, entries.length, little);
    entries.forEach((entry, index) => {
      const at = offset + 2 + index * 12;
      const type = entry.kind === 'ascii' ? TYPE_ASCII : entry.kind === 'long' ? TYPE_LONG : TYPE_RATIONAL;
      const count =
        entry.kind === 'ascii' ? entry.text.length + 1 : entry.kind === 'rational' ? entry.values.length : 1;
      view.setUint16(at, entry.tag, little);
      view.setUint16(at + 2, type, little);
      view.setUint32(at + 4, count, little);
      const size = dataSize(entry);
      if (size <= 4) {
        writeValue(at + 8, entry);
      } else {
        view.setUint32(at + 8, dataOffset, little);
        writeValue(dataOffset, entry);
        dataOffset += size;
      }
    });
    view.setUint32(offset + 2 + entries.length * 12, 0, little);
  };

  writeIfd(ifd0Offset, ifd0);
  if (exifEntries.length > 0) writeIfd(exifOffset, exifEntries);
  if (gpsEntries.length > 0) writeIfd(gpsOffset, gpsEntries);
  return bytes;
}

/** An APP1 "Exif" segment (marker, length, header and TIFF block). */
export function app1Segment(tiff: Uint8Array): Uint8Array {
  const length = 2 + 6 + tiff.length;
  const segment = new Uint8Array(2 + length);
  segment.set([0xff, 0xe1, length >> 8, length & 0xff, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
  segment.set(tiff, 10);
  return segment;
}

const APP0_JFIF = [
  0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
];
const SCAN_AND_END = [0xff, 0xda, 0x00, 0x02, 0x12, 0x34, 0xff, 0xd9];

/** A tiny (not decodable) JPEG byte stream: SOI, JFIF APP0, optional APP1 Exif, scan, EOI. */
export function buildExifJpeg(fixture?: ExifFixture): Uint8Array {
  const app1 = fixture === undefined ? new Uint8Array() : app1Segment(buildTiff(fixture));
  return Uint8Array.from([0xff, 0xd8, ...APP0_JFIF, ...app1, ...SCAN_AND_END]);
}

/** Inserts an APP1 Exif segment right after the SOI of real JPEG bytes. */
export function withExif(jpeg: Uint8Array, fixture: ExifFixture): Uint8Array {
  const app1 = app1Segment(buildTiff(fixture));
  const result = new Uint8Array(jpeg.length + app1.length);
  result.set(jpeg.subarray(0, 2));
  result.set(app1, 2);
  result.set(jpeg.subarray(2), 2 + app1.length);
  return result;
}

/** True when the bytes contain an APP1 segment with the "Exif" header anywhere. */
export function hasExifSegment(bytes: Uint8Array): boolean {
  for (let index = 0; index + 9 < bytes.length; index += 1) {
    if (
      bytes[index] === 0xff &&
      bytes[index + 1] === 0xe1 &&
      bytes[index + 4] === 0x45 &&
      bytes[index + 5] === 0x78 &&
      bytes[index + 6] === 0x69 &&
      bytes[index + 7] === 0x66
    ) {
      return true;
    }
  }
  return false;
}
