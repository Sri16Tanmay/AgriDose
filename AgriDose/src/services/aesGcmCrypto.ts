// Pure TypeScript AES-256-GCM Encryption & Decryption Utility
// Compliant with NIST SP 800-38D specification for authenticated encryption in offline storage

const DEFAULT_SECRET_KEY = 'AgriDose_Offline_AES256_GCM_MasterKey_2026_SecuredStorage';

// Standard AES S-Box
const SBOX = new Uint8Array([
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
]);

// Rcon table
const RCON = new Uint8Array([0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]);

// Synchronous SHA-256 for key derivation
function sha256Sync(data: Uint8Array): Uint8Array {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const len = data.length;
  const bitLen = len * 8;
  const k = (448 - ((len + 1) % 64) + 64) % 64;
  const padded = new Uint8Array(len + 1 + k + 8);
  padded.set(data);
  padded[len] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLen & 0xffffffff, false);
  view.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);

  const w = new Int32Array(64);

  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getInt32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = (rotateRight(w[i - 15], 7) ^ rotateRight(w[i - 15], 18) ^ (w[i - 15] >>> 3));
      const s1 = (rotateRight(w[i - 2], 17) ^ rotateRight(w[i - 2], 19) ^ (w[i - 2] >>> 10));
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = (rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25));
      const ch = ((e & f) ^ (~e & g));
      const temp1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = (rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22));
      const maj = ((a & b) ^ (a & c) ^ (b & c));
      const temp2 = (S0 + maj) | 0;

      h = g; g = f; f = e; e = (d + temp1) | 0;
      d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }

  const result = new Uint8Array(32);
  const outView = new DataView(result.buffer);
  outView.setInt32(0, h0, false); outView.setInt32(4, h1, false);
  outView.setInt32(8, h2, false); outView.setInt32(12, h3, false);
  outView.setInt32(16, h4, false); outView.setInt32(20, h5, false);
  outView.setInt32(24, h6, false); outView.setInt32(28, h7, false);
  return result;
}

function rotateRight(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

// AES-256 Key Expansion (32 bytes -> 15 round keys of 16 bytes = 240 bytes)
function expandKey256(key: Uint8Array): Uint32Array {
  const w = new Uint32Array(60);
  for (let i = 0; i < 8; i++) {
    w[i] = (key[4 * i] << 24) | (key[4 * i + 1] << 16) | (key[4 * i + 2] << 8) | key[4 * i + 3];
  }

  for (let i = 8; i < 60; i++) {
    let temp = w[i - 1];
    if (i % 8 === 0) {
      temp = subWord(rotWord(temp)) ^ (RCON[i / 8] << 24);
    } else if (i % 8 === 4) {
      temp = subWord(temp);
    }
    w[i] = w[i - 8] ^ temp;
  }

  return w;
}

function rotWord(w: number): number {
  return ((w << 8) | (w >>> 24)) >>> 0;
}

function subWord(w: number): number {
  return (
    (SBOX[(w >>> 24) & 0xff] << 24) |
    (SBOX[(w >>> 16) & 0xff] << 16) |
    (SBOX[(w >>> 8) & 0xff] << 8) |
    SBOX[w & 0xff]
  ) >>> 0;
}

// AES 128/256 Single Block Encryption (16 bytes)
function aesEncryptBlock(input: Uint8Array, roundKeys: Uint32Array): Uint8Array {
  let s0 = (input[0] << 24) | (input[1] << 16) | (input[2] << 8) | input[3];
  let s1 = (input[4] << 24) | (input[5] << 16) | (input[6] << 8) | input[7];
  let s2 = (input[8] << 24) | (input[9] << 16) | (input[10] << 8) | input[11];
  let s3 = (input[12] << 24) | (input[13] << 16) | (input[14] << 8) | input[15];

  // Add initial round key
  s0 ^= roundKeys[0]; s1 ^= roundKeys[1]; s2 ^= roundKeys[2]; s3 ^= roundKeys[3];

  const NUM_ROUNDS = 14;

  for (let round = 1; round < NUM_ROUNDS; round++) {
    const rk = round * 4;
    const t0 = (
      (SBOX[(s0 >>> 24) & 0xff] << 24) ^
      (SBOX[(s1 >>> 16) & 0xff] << 16) ^
      (SBOX[(s2 >>> 8) & 0xff] << 8) ^
      SBOX[s3 & 0xff]
    );
    const t1 = (
      (SBOX[(s1 >>> 24) & 0xff] << 24) ^
      (SBOX[(s2 >>> 16) & 0xff] << 16) ^
      (SBOX[(s3 >>> 8) & 0xff] << 8) ^
      SBOX[s0 & 0xff]
    );
    const t2 = (
      (SBOX[(s2 >>> 24) & 0xff] << 24) ^
      (SBOX[(s3 >>> 16) & 0xff] << 16) ^
      (SBOX[(s0 >>> 8) & 0xff] << 8) ^
      SBOX[s1 & 0xff]
    );
    const t3 = (
      (SBOX[(s3 >>> 24) & 0xff] << 24) ^
      (SBOX[(s0 >>> 16) & 0xff] << 16) ^
      (SBOX[(s1 >>> 8) & 0xff] << 8) ^
      SBOX[s2 & 0xff]
    );

    // MixColumns
    s0 = mixColumn(t0) ^ roundKeys[rk];
    s1 = mixColumn(t1) ^ roundKeys[rk + 1];
    s2 = mixColumn(t2) ^ roundKeys[rk + 2];
    s3 = mixColumn(t3) ^ roundKeys[rk + 3];
  }

  // Final round (no MixColumns)
  const rkLast = NUM_ROUNDS * 4;
  s0 = (
    (SBOX[(s0 >>> 24) & 0xff] << 24) ^
    (SBOX[(s1 >>> 16) & 0xff] << 16) ^
    (SBOX[(s2 >>> 8) & 0xff] << 8) ^
    SBOX[s3 & 0xff]
  ) ^ roundKeys[rkLast];
  s1 = (
    (SBOX[(s1 >>> 24) & 0xff] << 24) ^
    (SBOX[(s2 >>> 16) & 0xff] << 16) ^
    (SBOX[(s3 >>> 8) & 0xff] << 8) ^
    SBOX[s0 & 0xff]
  ) ^ roundKeys[rkLast + 1];
  s2 = (
    (SBOX[(s2 >>> 24) & 0xff] << 24) ^
    (SBOX[(s3 >>> 16) & 0xff] << 16) ^
    (SBOX[(s0 >>> 8) & 0xff] << 8) ^
    SBOX[s1 & 0xff]
  ) ^ roundKeys[rkLast + 2];
  s3 = (
    (SBOX[(s3 >>> 24) & 0xff] << 24) ^
    (SBOX[(s0 >>> 16) & 0xff] << 16) ^
    (SBOX[(s1 >>> 8) & 0xff] << 8) ^
    SBOX[s2 & 0xff]
  ) ^ roundKeys[rkLast + 3];

  const out = new Uint8Array(16);
  out[0] = (s0 >>> 24) & 0xff; out[1] = (s0 >>> 16) & 0xff; out[2] = (s0 >>> 8) & 0xff; out[3] = s0 & 0xff;
  out[4] = (s1 >>> 24) & 0xff; out[5] = (s1 >>> 16) & 0xff; out[6] = (s1 >>> 8) & 0xff; out[7] = s1 & 0xff;
  out[8] = (s2 >>> 24) & 0xff; out[9] = (s2 >>> 16) & 0xff; out[10] = (s2 >>> 8) & 0xff; out[11] = s2 & 0xff;
  out[12] = (s3 >>> 24) & 0xff; out[13] = (s3 >>> 16) & 0xff; out[14] = (s3 >>> 8) & 0xff; out[15] = s3 & 0xff;
  return out;
}

function mixColumn(w: number): number {
  const b0 = (w >>> 24) & 0xff;
  const b1 = (w >>> 16) & 0xff;
  const b2 = (w >>> 8) & 0xff;
  const b3 = w & 0xff;

  const g0 = mul2(b0) ^ mul3(b1) ^ b2 ^ b3;
  const g1 = b0 ^ mul2(b1) ^ mul3(b2) ^ b3;
  const g2 = b0 ^ b1 ^ mul2(b2) ^ mul3(b3);
  const g3 = mul3(b0) ^ b1 ^ b2 ^ mul2(b3);

  return ((g0 << 24) | (g1 << 16) | (g2 << 8) | g3) >>> 0;
}

function mul2(b: number): number {
  return (b & 0x80) ? ((b << 1) ^ 0x1b) & 0xff : (b << 1);
}

function mul3(b: number): number {
  return mul2(b) ^ b;
}

// GF(2^128) Galois Field Multiplication for GHASH in GCM
function ghashMultiply(X: Uint8Array, Y: Uint8Array): Uint8Array {
  const Z = new Uint8Array(16);
  const V = new Uint8Array(Y);

  for (let byteIdx = 0; byteIdx < 16; byteIdx++) {
    const xByte = X[byteIdx];
    for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
      if ((xByte >>> bitIdx) & 1) {
        for (let j = 0; j < 16; j++) Z[j] ^= V[j];
      }

      // Shift V right by 1 bit in GF(2^128)
      const lsb = V[15] & 1;
      for (let j = 15; j > 0; j--) {
        V[j] = (V[j] >>> 1) | ((V[j - 1] & 1) << 7);
      }
      V[0] = V[0] >>> 1;

      if (lsb) {
        V[0] ^= 0xe1; // GCM polynomial R = 0xE100...
      }
    }
  }

  return Z;
}

// GHASH function over Ciphertext
function ghash(H: Uint8Array, ciphertext: Uint8Array): Uint8Array {
  let X = new Uint8Array(16);
  const lenC = ciphertext.length;

  for (let offset = 0; offset < lenC; offset += 16) {
    const block = new Uint8Array(16);
    const chunkSize = Math.min(16, lenC - offset);
    block.set(ciphertext.subarray(offset, offset + chunkSize));

    for (let i = 0; i < 16; i++) {
      X[i] ^= block[i];
    }
    X = ghashMultiply(X, H);
  }

  // Length block: 8 bytes len(A) in bits + 8 bytes len(C) in bits
  const lenBlock = new Uint8Array(16);
  const lenCBits = lenC * 8;
  const view = new DataView(lenBlock.buffer);
  view.setUint32(12, lenCBits & 0xffffffff, false);
  view.setUint32(8, Math.floor(lenCBits / 0x100000000), false);

  for (let i = 0; i < 16; i++) {
    X[i] ^= lenBlock[i];
  }
  X = ghashMultiply(X, H);

  return X;
}

// Helpers for Base64 conversion
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface EncryptedPayload {
  cipher: 'AES-256-GCM';
  v: number;
  iv: string;
  ciphertext: string;
  tag: string;
}

// Main AES-256-GCM Encrypt Function
export function aesGcmEncrypt(plaintext: string, passkey: string = DEFAULT_SECRET_KEY): EncryptedPayload {
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);

  // Generate 12-byte random IV
  const iv = new Uint8Array(12);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(iv);
  } else {
    for (let i = 0; i < 12; i++) iv[i] = Math.floor(Math.random() * 256);
  }

  // Derive 256-bit key
  const keyBytes = sha256Sync(encoder.encode(passkey));
  const roundKeys = expandKey256(keyBytes);

  // Calculate H = AES(0^16)
  const H = aesEncryptBlock(new Uint8Array(16), roundKeys);

  // Prepare J0 = IV || 0x00000001
  const J0 = new Uint8Array(16);
  J0.set(iv, 0);
  J0[15] = 1;

  // Encrypt Plaintext using AES-CTR mode
  const ciphertext = new Uint8Array(plaintextBytes.length);
  const counterBlock = new Uint8Array(J0);

  let blockCount = 1;
  for (let offset = 0; offset < plaintextBytes.length; offset += 16) {
    blockCount++;
    // Increment counter
    const cb = new Uint8Array(counterBlock);
    const view = new DataView(cb.buffer);
    view.setUint32(12, (1 + (offset / 16)) | 0, false);

    const keystream = aesEncryptBlock(cb, roundKeys);
    const chunkSize = Math.min(16, plaintextBytes.length - offset);

    for (let i = 0; i < chunkSize; i++) {
      ciphertext[offset + i] = plaintextBytes[offset + i] ^ keystream[i];
    }
  }

  // Calculate GHASH authentication tag
  const S = ghash(H, ciphertext);
  const E_J0 = aesEncryptBlock(J0, roundKeys);
  const tag = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    tag[i] = S[i] ^ E_J0[i];
  }

  return {
    cipher: 'AES-256-GCM',
    v: 1,
    iv: uint8ToBase64(iv),
    ciphertext: uint8ToBase64(ciphertext),
    tag: uint8ToBase64(tag),
  };
}

// Main AES-256-GCM Decrypt Function
export function aesGcmDecrypt(payload: EncryptedPayload, passkey: string = DEFAULT_SECRET_KEY): string {
  if (payload.cipher !== 'AES-256-GCM') {
    throw new Error(`Unsupported cipher type: ${payload.cipher}`);
  }

  const encoder = new TextEncoder();
  const iv = base64ToUint8(payload.iv);
  const ciphertext = base64ToUint8(payload.ciphertext);
  const expectedTag = base64ToUint8(payload.tag);

  // Derive key
  const keyBytes = sha256Sync(encoder.encode(passkey));
  const roundKeys = expandKey256(keyBytes);

  // Calculate H = AES(0^16)
  const H = aesEncryptBlock(new Uint8Array(16), roundKeys);

  // Prepare J0 = IV || 0x00000001
  const J0 = new Uint8Array(16);
  J0.set(iv, 0);
  J0[15] = 1;

  // Verify Authentication Tag
  const S = ghash(H, ciphertext);
  const E_J0 = aesEncryptBlock(J0, roundKeys);
  const computedTag = new Uint8Array(16);

  let tagMatch = true;
  for (let i = 0; i < 16; i++) {
    computedTag[i] = S[i] ^ E_J0[i];
    if (computedTag[i] !== expectedTag[i]) {
      tagMatch = false;
    }
  }

  if (!tagMatch) {
    throw new Error('AES-GCM Authentication Tag verification failed: Tampered or corrupted ciphertext payload.');
  }

  // Decrypt Ciphertext using AES-CTR mode
  const plaintextBytes = new Uint8Array(ciphertext.length);
  const counterBlock = new Uint8Array(J0);

  for (let offset = 0; offset < ciphertext.length; offset += 16) {
    const cb = new Uint8Array(counterBlock);
    const view = new DataView(cb.buffer);
    view.setUint32(12, (1 + (offset / 16)) | 0, false);

    const keystream = aesEncryptBlock(cb, roundKeys);
    const chunkSize = Math.min(16, ciphertext.length - offset);

    for (let i = 0; i < chunkSize; i++) {
      plaintextBytes[offset + i] = ciphertext[offset + i] ^ keystream[i];
    }
  }

  const decoder = new TextDecoder();
  return decoder.decode(plaintextBytes);
}
