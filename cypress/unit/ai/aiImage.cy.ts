import { prepareAiImage, readPhotoBytes, scaleToLongSide } from '../../../src/utils/aiImage.web';
import { readExif } from '../../../src/utils/exif';
import { hasExifSegment, withExif } from './exifFixture';

// The ≤768 px, EXIF-free JPEG that is the only thing ever sent to Co-Driver (SPEC §0.1, §9.1).
function canvasJpeg(width: number, height: number): Uint8Array {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('no 2d context');
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgb(200, 30, 30)');
  gradient.addColorStop(1, 'rgb(20, 20, 160)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.fillStyle = 'rgb(250, 250, 250)';
  context.fillRect(width * 0.4, height * 0.6, width * 0.2, height * 0.08);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  const binary = atob(dataUrl.slice(dataUrl.indexOf(',') + 1));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function toDataUrl(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `data:image/jpeg;base64,${btoa(binary)}`;
}

async function blobBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

describe('scaleToLongSide', () => {
  it('fits the long side and never upscales', () => {
    expect(scaleToLongSide(4000, 3000, 768)).to.deep.equal({ width: 768, height: 576 });
    expect(scaleToLongSide(1080, 1920, 768)).to.deep.equal({ width: 432, height: 768 });
    expect(scaleToLongSide(300, 200, 768)).to.deep.equal({ width: 300, height: 200 });
    expect(scaleToLongSide(0, 0, 768)).to.deep.equal({ width: 1, height: 1 });
  });
});

describe('prepareAiImage (web)', () => {
  it('downscales to 768 px, re-encodes as JPEG and strips the EXIF (GPS included)', () => {
    const original = withExif(canvasJpeg(2000, 1000), {
      dateTimeOriginal: '2026:11:03 14:12:00',
      gps: { latitude: 50.492, longitude: 5.864 },
    });
    expect(readExif(original).gps, 'the input really has GPS').to.not.equal(undefined);
    expect(hasExifSegment(original)).to.equal(true);

    cy.then(() => prepareAiImage({ uri: toDataUrl(original), width: 2000, height: 1000 })).then(async (image) => {
      expect(image, 'AiImage').to.not.equal(undefined);
      if (image === undefined) return;
      expect(image.width).to.equal(768);
      expect(image.height).to.equal(384);
      expect(image.blob.type).to.equal('image/jpeg');
      expect(image.dHash).to.match(/^[0-9a-f]{16}$/);
      const bytes = await blobBytes(image.blob);
      expect(bytes[0]).to.equal(0xff);
      expect(bytes[1]).to.equal(0xd8);
      expect(hasExifSegment(bytes), 'no APP1 Exif segment').to.equal(false);
      expect(readExif(bytes)).to.deep.equal({});
    });
  });

  it('keeps a small photo at its size and gives the same dHash for the same photo', () => {
    const uri = toDataUrl(canvasJpeg(300, 200));
    cy.then(() =>
      Promise.all([prepareAiImage({ uri, width: 300, height: 200 }), prepareAiImage({ uri, width: 300, height: 200 })]),
    ).then(([first, second]) => {
      expect(first?.width).to.equal(300);
      expect(first?.height).to.equal(200);
      expect(first?.dHash).to.equal(second?.dHash);
    });
  });

  it('returns undefined for a photo the browser cannot decode', () => {
    cy.then(() => prepareAiImage({ uri: 'data:image/jpeg;base64,AAAA', width: 10, height: 10 })).should(
      'equal',
      undefined,
    );
  });
});

describe('readPhotoBytes (web)', () => {
  it('reads the bytes of a data URI and returns empty bytes on failure', () => {
    const bytes = canvasJpeg(64, 48);
    cy.then(() => readPhotoBytes(toDataUrl(bytes))).then((read) => {
      expect(read.length).to.equal(bytes.length);
      expect(read[0]).to.equal(0xff);
    });
    cy.then(() => readPhotoBytes('blob:http://localhost/does-not-exist')).then((read) => {
      expect(read.length).to.equal(0);
    });
  });
});
