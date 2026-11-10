import { exifDateToIso, readExif } from '../../../src/utils/exif';
import { app1Segment, buildExifJpeg, buildTiff } from './exifFixture';

// On-device EXIF reader (SPEC §15 W3 task 4): DateTimeOriginal and GPS, both byte orders, never throws.
const SPA = { latitude: 50.492, longitude: 5.864 };

describe('readExif', () => {
  it('reads DateTimeOriginal with its offset and the GPS position (little-endian)', () => {
    const bytes = buildExifJpeg({
      dateTimeOriginal: '2026:11:03 14:12:00',
      offsetTimeOriginal: '+01:00',
      gps: SPA,
    });
    const exif = readExif(bytes);
    expect(exif.takenAt).to.equal('2026-11-03T13:12:00.000Z');
    expect(exif.gps?.latitude).to.be.closeTo(SPA.latitude, 1e-6);
    expect(exif.gps?.longitude).to.be.closeTo(SPA.longitude, 1e-6);
  });

  it('reads the same values from a big-endian (Motorola) TIFF', () => {
    const bytes = buildExifJpeg({
      dateTimeOriginal: '2026:11:03 14:12:00',
      offsetTimeOriginal: '+01:00',
      gps: SPA,
      littleEndian: false,
    });
    const exif = readExif(bytes);
    expect(exif.takenAt).to.equal('2026-11-03T13:12:00.000Z');
    expect(exif.gps?.latitude).to.be.closeTo(SPA.latitude, 1e-6);
    expect(exif.gps?.longitude).to.be.closeTo(SPA.longitude, 1e-6);
  });

  it('uses the device time zone when there is no offset', () => {
    const exif = readExif(buildExifJpeg({ dateTimeOriginal: '2026:11:03 14:12:00' }));
    expect(exif.takenAt).to.equal(new Date(2026, 10, 3, 14, 12, 0).toISOString());
    expect(exif.gps).to.equal(undefined);
  });

  it('applies the S and W references as negative coordinates', () => {
    const exif = readExif(buildExifJpeg({ gps: { latitude: -33.8688, longitude: -70.6483 } }));
    expect(exif.gps?.latitude).to.be.closeTo(-33.8688, 1e-6);
    expect(exif.gps?.longitude).to.be.closeTo(-70.6483, 1e-6);
    expect(exif.takenAt).to.equal(undefined);
  });

  it('ignores a 0/0 GPS position and impossible dates', () => {
    expect(readExif(buildExifJpeg({ gps: { latitude: 0, longitude: 0 } }))).to.deep.equal({});
    expect(readExif(buildExifJpeg({ dateTimeOriginal: '0000:00:00 00:00:00' }))).to.deep.equal({});
    expect(readExif(buildExifJpeg({ dateTimeOriginal: '2026:02:31 10:00:00' }))).to.deep.equal({});
    expect(readExif(buildExifJpeg({ dateTimeOriginal: '    :  :     :  :  ' }))).to.deep.equal({});
  });

  it('returns nothing for a JPEG without an APP1 Exif segment', () => {
    expect(readExif(buildExifJpeg())).to.deep.equal({});
  });

  it('returns nothing for bytes that are not a JPEG', () => {
    expect(readExif(new Uint8Array())).to.deep.equal({});
    expect(readExif(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).to.deep.equal({});
    // A bare TIFF block (no JPEG around it) is not read either.
    expect(readExif(buildTiff({ gps: SPA }))).to.deep.equal({});
  });

  it('never throws on truncated or corrupted data', () => {
    const full = buildExifJpeg({ dateTimeOriginal: '2026:11:03 14:12:00', gps: SPA });
    for (let length = 0; length < full.length; length += 1) {
      expect(() => readExif(full.subarray(0, length))).not.to.throw();
    }
    // Deterministic pseudo-random corruption of every byte after the SOI.
    let seed = 42;
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let round = 0; round < 300; round += 1) {
      const corrupted = Uint8Array.from(full);
      const flips = 1 + Math.floor(random() * 8);
      for (let flip = 0; flip < flips; flip += 1) {
        corrupted[2 + Math.floor(random() * (corrupted.length - 2))] = Math.floor(random() * 256);
      }
      expect(() => readExif(corrupted)).not.to.throw();
    }
  });

  it('survives an IFD that declares far more entries than exist', () => {
    const tiff = buildTiff({ dateTimeOriginal: '2026:11:03 14:12:00' });
    new DataView(tiff.buffer).setUint16(8, 0xffff, true);
    const bytes = Uint8Array.from([0xff, 0xd8, ...app1Segment(tiff), 0xff, 0xd9]);
    expect(() => readExif(bytes)).not.to.throw();
  });

  it('reads the real test photo without throwing', () => {
    cy.fixture('car.jpg', null).then((buffer: Uint8Array) => {
      const exif = readExif(new Uint8Array(buffer));
      expect(exif).to.be.an('object');
    });
  });
});

describe('exifDateToIso', () => {
  it('converts with a positive and a negative offset', () => {
    expect(exifDateToIso('2026:07:01 09:30:15', '+02:00')).to.equal('2026-07-01T07:30:15.000Z');
    expect(exifDateToIso('2026:07:01 09:30:15', '-05:30')).to.equal('2026-07-01T15:00:15.000Z');
  });

  it('rejects malformed values', () => {
    expect(exifDateToIso('2026-07-01')).to.equal(undefined);
    expect(exifDateToIso('2026:13:01 09:30:15')).to.equal(undefined);
    expect(exifDateToIso('2026:07:01 25:30:15')).to.equal(undefined);
  });
});
