import type { PlateRegion } from '../../../src/types/Spot';
import { redactPhoto } from '../../../src/utils/imageRedaction';
import { variance } from '../../../src/utils/redactionMath';
import { hasExifSegment, withExif } from '../ai/exifFixture';

/**
 * SPEC P0-04: the uploaded JPEG has no EXIF and the pixel variance inside every region is at least
 * 80 % lower than in the original. Runs the real canvas redaction (imageRedaction.web.ts) in the
 * browser on a high-detail fixture canvas.
 */

const SIZE = { width: 400, height: 300 };
const REGIONS: PlateRegion[] = [
  { x: 0.1, y: 0.6, width: 0.3, height: 0.12 },
  { x: 0.6, y: 0.2, width: 0.25, height: 0.1 },
];

function context(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const result = canvas.getContext('2d');
  if (result === null) throw new Error('no 2d context');
  return result;
}

/** A canvas full of fine black-and-white detail (like the characters of a plate). */
function detailCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE.width;
  canvas.height = SIZE.height;
  const ctx = context(canvas);
  for (let y = 0; y < SIZE.height; y += 2) {
    for (let x = 0; x < SIZE.width; x += 2) {
      ctx.fillStyle = (x + y) % 4 === 0 ? 'black' : 'white';
      ctx.fillRect(x, y, 2, 2);
    }
  }
  return canvas;
}

function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('load'));
    image.src = uri;
  });
}

/** Grey values (luma) of a region of an image drawn at SIZE. */
function regionGray(source: CanvasImageSource, region: PlateRegion): number[] {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE.width;
  canvas.height = SIZE.height;
  const ctx = context(canvas);
  ctx.drawImage(source, 0, 0, SIZE.width, SIZE.height);
  const x = Math.ceil(region.x * SIZE.width);
  const y = Math.ceil(region.y * SIZE.height);
  const width = Math.floor(region.width * SIZE.width) - 1;
  const height = Math.floor(region.height * SIZE.height) - 1;
  const data = ctx.getImageData(x, y, width, height).data;
  const gray: number[] = [];
  for (let index = 0; index + 3 < data.length; index += 4) {
    gray.push(0.299 * (data[index] ?? 0) + 0.587 * (data[index + 1] ?? 0) + 0.114 * (data[index + 2] ?? 0));
  }
  return gray;
}

function base64Bytes(dataUri: string): Uint8Array {
  const binary = atob(dataUri.slice(dataUri.indexOf(',') + 1));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function bytesToDataUri(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `data:image/jpeg;base64,${btoa(binary)}`;
}

describe('imageRedaction (web canvas)', () => {
  it('lowers the pixel variance inside every region by at least 80 %', () => {
    const original = detailCanvas();
    cy.then(() => redactPhoto({ uri: original.toDataURL('image/png'), ...SIZE }, REGIONS, 1600)).then(
      async (redacted) => {
        expect(redacted.mimeType).to.equal('image/jpeg');
        expect(redacted.uri.startsWith('data:image/jpeg')).to.equal(true);
        const image = await loadImage(redacted.uri);
        REGIONS.forEach((region, index) => {
          const before = variance(regionGray(original, region));
          const after = variance(regionGray(image, region));
          expect(before, `original detail in region ${index}`).to.be.greaterThan(1000);
          expect(after, `variance left in region ${index}`).to.be.at.most(before * 0.2);
        });
      },
    );
  });

  it('keeps the detail outside the regions', () => {
    const original = detailCanvas();
    const outside: PlateRegion = { x: 0.05, y: 0.05, width: 0.2, height: 0.2 };
    cy.then(() => redactPhoto({ uri: original.toDataURL('image/png'), ...SIZE }, REGIONS, 1600)).then(
      async (redacted) => {
        const image = await loadImage(redacted.uri);
        expect(variance(regionGray(image, outside))).to.be.greaterThan(variance(regionGray(original, outside)) * 0.5);
      },
    );
  });

  it('re-encodes a photo with EXIF into a JPEG without an Exif segment', () => {
    cy.fixture('car.jpg', 'base64').then((base64: string) => {
      const jpeg = base64Bytes(`data:image/jpeg;base64,${base64}`);
      const withGps = withExif(jpeg, {
        dateTimeOriginal: '2026:11:03 14:12:00',
        gps: { latitude: 50.49, longitude: 5.86 },
      });
      expect(hasExifSegment(withGps), 'fixture has EXIF').to.equal(true);
      cy.then(() => redactPhoto({ uri: bytesToDataUri(withGps), width: 0, height: 0 }, REGIONS)).then((redacted) => {
        expect(hasExifSegment(base64Bytes(redacted.uri)), 'upload has EXIF').to.equal(false);
      });
    });
  });

  it('scales to the requested long side (preview 960, upload 1600)', () => {
    const big = document.createElement('canvas');
    big.width = 2000;
    big.height = 1500;
    context(big).fillRect(0, 0, 2000, 1500);
    const photo = { uri: big.toDataURL('image/png'), width: 2000, height: 1500 };
    cy.then(() => redactPhoto(photo, [], 960))
      .its('width')
      .should('equal', 960);
    cy.then(() => redactPhoto(photo, []))
      .its('width')
      .should('equal', 1600);
  });
});
