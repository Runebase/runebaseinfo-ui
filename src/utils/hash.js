// For synchronous hashing needed by base58/address code, we use a simple approach
// The original used crypto-browserify which is a Node polyfill
// For Vite, we use the buffer package and a lightweight approach

import { Buffer } from 'buffer'

// We need synchronous hashing for base58check - use js-sha256 style inline
function sha256Sync(buffer) {
  // Use a synchronous SHA-256 implementation
  const crypto = globalThis.crypto || globalThis.msCrypto
  // Fallback: use a simple sync sha256
  // For browser compatibility, we'll use SubtleCrypto when possible
  // but Base58Check needs sync, so we include a minimal sync sha256
  return syncSha256(Buffer.from(buffer))
}

// Minimal synchronous SHA-256 implementation for browser use
function syncSha256(data) {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0cf66, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ])

  let H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ])

  const msg = Buffer.from(data)
  const len = msg.length
  const bitLen = len * 8

  // Padding
  let totalLen = len + 1
  while (totalLen % 64 !== 56) totalLen++
  totalLen += 8

  const padded = Buffer.alloc(totalLen)
  msg.copy(padded)
  padded[len] = 0x80
  // Write bit length as big-endian 64-bit
  padded.writeUInt32BE(Math.floor(bitLen / 0x100000000), totalLen - 8)
  padded.writeUInt32BE(bitLen >>> 0, totalLen - 4)

  const W = new Uint32Array(64)

  for (let offset = 0; offset < totalLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = padded.readUInt32BE(offset + i * 4)
    }
    for (let i = 16; i < 64; i++) {
      const s0 = (rotr(W[i-15], 7) ^ rotr(W[i-15], 18) ^ (W[i-15] >>> 3)) >>> 0
      const s1 = (rotr(W[i-2], 17) ^ rotr(W[i-2], 19) ^ (W[i-2] >>> 10)) >>> 0
      W[i] = (W[i-16] + s0 + W[i-7] + s1) >>> 0
    }

    let [a, b, c, d, e, f, g, h] = H

    for (let i = 0; i < 64; i++) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0
      const ch = ((e & f) ^ (~e & g)) >>> 0
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0
      const temp2 = (S0 + maj) >>> 0

      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    H[0] = (H[0] + a) >>> 0
    H[1] = (H[1] + b) >>> 0
    H[2] = (H[2] + c) >>> 0
    H[3] = (H[3] + d) >>> 0
    H[4] = (H[4] + e) >>> 0
    H[5] = (H[5] + f) >>> 0
    H[6] = (H[6] + g) >>> 0
    H[7] = (H[7] + h) >>> 0
  }

  const result = Buffer.alloc(32)
  for (let i = 0; i < 8; i++) {
    result.writeUInt32BE(H[i], i * 4)
  }
  return result
}

function rotr(x, n) {
  return ((x >>> n) | (x << (32 - n))) >>> 0
}

export function sha256(buffer) {
  return syncSha256(Buffer.from(buffer))
}
sha256.blocksize = 512

export function sha256sha256(buffer) {
  return sha256(sha256(buffer))
}

export function ripemd160(buffer) {
  // Minimal RIPEMD-160 for address validation
  return syncRipemd160(Buffer.from(buffer))
}

function syncRipemd160(message) {
  // RIPEMD-160 constants and functions
  const zl = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]
  const zr = [5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]
  const sl = [11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]
  const sr = [8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]
  const kl = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e]
  const kr = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000]

  function f(j, x, y, z) {
    if (j <= 15) return x ^ y ^ z
    if (j <= 31) return (x & y) | (~x & z)
    if (j <= 47) return (x | ~y) ^ z
    if (j <= 63) return (x & z) | (y & ~z)
    return x ^ (y | ~z)
  }

  function rotl32(x, n) { return ((x << n) | (x >>> (32 - n))) >>> 0 }

  const msg = Buffer.from(message)
  const len = msg.length
  let totalLen = len + 1
  while (totalLen % 64 !== 56) totalLen++
  totalLen += 8
  const padded = Buffer.alloc(totalLen)
  msg.copy(padded)
  padded[len] = 0x80
  padded.writeUInt32LE(len * 8, totalLen - 8)
  padded.writeUInt32LE(0, totalLen - 4)

  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0

  for (let offset = 0; offset < totalLen; offset += 64) {
    const x = []
    for (let i = 0; i < 16; i++) x.push(padded.readUInt32LE(offset + i * 4))

    let al = h0, bl = h1, cl = h2, dl = h3, el = h4
    let ar = h0, br = h1, cr = h2, dr = h3, er = h4

    for (let j = 0; j < 80; j++) {
      const rnd = j >> 4
      let t = (al + f(j, bl, cl, dl) + x[zl[j]] + kl[rnd]) >>> 0
      t = (rotl32(t, sl[j]) + el) >>> 0
      al = el; el = dl; dl = rotl32(cl, 10); cl = bl; bl = t

      t = (ar + f(79-j, br, cr, dr) + x[zr[j]] + kr[rnd]) >>> 0
      t = (rotl32(t, sr[j]) + er) >>> 0
      ar = er; er = dr; dr = rotl32(cr, 10); cr = br; br = t
    }

    const t = (h1 + cl + dr) >>> 0
    h1 = (h2 + dl + er) >>> 0
    h2 = (h3 + el + ar) >>> 0
    h3 = (h4 + al + br) >>> 0
    h4 = (h0 + bl + cr) >>> 0
    h0 = t
  }

  const result = Buffer.alloc(20)
  result.writeUInt32LE(h0, 0)
  result.writeUInt32LE(h1, 4)
  result.writeUInt32LE(h2, 8)
  result.writeUInt32LE(h3, 12)
  result.writeUInt32LE(h4, 16)
  return result
}

export function sha256ripemd160(buffer) {
  return ripemd160(sha256(Buffer.from(buffer)))
}
