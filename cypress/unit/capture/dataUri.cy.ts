import { dataUriToArrayBuffer, dataUriToBytes } from '../../../src/utils/dataUri';

// The photo upload and the EXIF read decode data: URIs locally, because the CSP's connect-src does
// not let fetch() read them in every browser (review finding: uploads failed on the deployed PWA).
describe('dataUri', () => {
  it('decodes a base64 JPEG data URI to its bytes', () => {
    const bytes = dataUriToBytes('data:image/jpeg;base64,/9j/4AAQ');
    expect(Array.from(bytes ?? [])).to.deep.equal([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  });

  it('decodes a percent-encoded text data URI', () => {
    expect(new TextDecoder().decode(dataUriToBytes('data:text/plain,Hi%20there'))).to.equal('Hi there');
  });

  it('gives a fresh ArrayBuffer of exactly the photo bytes (the upload body)', () => {
    const buffer = dataUriToArrayBuffer('data:image/jpeg;base64,/9j/4AAQ');
    expect(buffer?.byteLength).to.equal(6);
    expect(new Uint8Array(buffer ?? new ArrayBuffer(0))[0]).to.equal(0xff);
  });

  it('leaves every other URI to fetch', () => {
    expect(dataUriToBytes('blob:http://localhost/abc')).to.equal(undefined);
    expect(dataUriToBytes('file:///photo.jpg')).to.equal(undefined);
    expect(dataUriToBytes('data:broken')).to.equal(undefined);
    expect(dataUriToArrayBuffer('https://x.supabase.co/photo.jpg')).to.equal(undefined);
  });
});
