// utils/encode.ts
export function encodeId(id: string) {
  if (typeof window !== 'undefined') {
    // Browser
    return btoa(id).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  // Node.js (server)
  return Buffer.from(id).toString('base64url');
}

export function decodeId(encoded: string) {
  if (typeof window !== 'undefined') {
    // Browser
    let str = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return atob(str);
  }
  // Node.js (server)
  return Buffer.from(encoded, 'base64url').toString('utf-8');
}
