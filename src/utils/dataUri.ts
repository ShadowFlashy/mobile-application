/**
 * Decodes a `data:` URI to its bytes without `fetch`.
 *
 * The PWA's Content-Security-Policy only lets `fetch` reach the app itself and Supabase, so the
 * photo (a `data:` URI from the image picker and from the redaction canvas) is decoded locally
 * instead of being "downloaded" from itself. Returns undefined for any other kind of URI.
 */
export function dataUriToBytes(uri: string): Uint8Array | undefined {
  if (!uri.startsWith('data:')) return undefined;
  const comma = uri.indexOf(',');
  if (comma < 0) return undefined;
  const header = uri.slice(5, comma);
  const payload = uri.slice(comma + 1);
  if (header.split(';').includes('base64')) {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }
  return new TextEncoder().encode(decodeURIComponent(payload));
}

/** The bytes of a `data:` URI as a fresh ArrayBuffer (the upload body), or undefined for other URIs. */
export function dataUriToArrayBuffer(uri: string): ArrayBuffer | undefined {
  const bytes = dataUriToBytes(uri);
  if (bytes === undefined) return undefined;
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}
