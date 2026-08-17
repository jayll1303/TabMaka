import { inflateSync, deflateSync } from "node:zlib";
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";

// --- CRC + chunk helpers (PNG) ---
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

// --- Decode 8-bit RGBA, non-interlaced PNG to raw RGBA ---
function decode(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let pos = 8;
  let width = 0;
  let height = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const bitDepth = data[8];
      const colorType = data[9];
      const interlace = data[12];
      if (bitDepth !== 8 || colorType !== 6 || interlace !== 0)
        throw new Error(`unsupported PNG: depth=${bitDepth} color=${colorType} interlace=${interlace}`);
    } else if (type === "IDAT") {
      idat.push(Buffer.from(data));
    } else if (type === "IEND") {
      break;
    }
    pos += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = 4;
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  };
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++];
    for (let x = 0; x < stride; x++) {
      const cur = raw[rp++];
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = y > 0 && x >= bpp ? out[(y - 1) * stride + x - bpp] : 0;
      let val;
      switch (filter) {
        case 0: val = cur; break;
        case 1: val = cur + a; break;
        case 2: val = cur + b; break;
        case 3: val = cur + ((a + b) >> 1); break;
        case 4: val = cur + paeth(a, b, c); break;
        default: throw new Error("bad filter " + filter);
      }
      out[y * stride + x] = val & 0xff;
    }
  }
  return { width, height, data: out };
}

// --- Encode raw RGBA to PNG (filter 0) ---
function encode(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const stride = width * 4;
  const filtered = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    filtered[y * (stride + 1)] = 0;
    rgba.copy(filtered, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(filtered, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- Repaint the baked black eye bead with body green ---
const FILE = "public/sprites/frog/frog_body.png";
const BACKUP = "public/sprites/frog/frog_body.original.png";
const BODY_GREEN = [0x82, 0xc3, 0x55]; // palette.body #82c355
const EYE = { x: 313.3, y: 85.8, r: 38.8 };

const src = readFileSync(FILE);
const { width, height, data } = decode(src);

const er = EYE.r * 1.18;
const x0 = Math.max(0, Math.floor(EYE.x - er));
const x1 = Math.min(width, Math.ceil(EYE.x + er));
const y0 = Math.max(0, Math.floor(EYE.y - er));
const y1 = Math.min(height, Math.ceil(EYE.y + er));
let painted = 0;
for (let y = y0; y < y1; y++) {
  for (let x = x0; x < x1; x++) {
    const dx = x - EYE.x;
    const dy = y - EYE.y;
    if (dx * dx + dy * dy > er * er) continue;
    const i = (y * width + x) * 4;
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (data[i + 3] > 10 && lum < 95) {
      data[i] = BODY_GREEN[0];
      data[i + 1] = BODY_GREEN[1];
      data[i + 2] = BODY_GREEN[2];
      data[i + 3] = 255;
      painted++;
    }
  }
}

if (!existsSync(BACKUP)) copyFileSync(FILE, BACKUP);
writeFileSync(FILE, encode(width, height, data));
console.log(`Repainted ${painted} eye-bead pixels. Backup: ${BACKUP}`);
