import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

// --- Minimal PNG (RGBA, 8-bit) encoder ---
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
function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

// --- Draw the companion icon (blue eel head + eye) ---
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const palette = {
  bg1: "#0e1526",
  bg2: "#1b2a4a",
  body: "#5b8dd9",
  outline: "#2f4d80",
  belly: "#a9c8f0",
  eye: "#ffffff",
  pupil: "#12203a",
};

function drawIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const ss = 4; // supersample
  const W = size * ss, H = size * ss;
  const acc = new Float32Array(W * H * 4);

  const [bg1r, bg1g, bg1b] = hexToRgb(palette.bg1);
  const [bg2r, bg2g, bg2b] = hexToRgb(palette.bg2);
  const [br, bg, bb] = hexToRgb(palette.body);
  const [or_, og, ob] = hexToRgb(palette.outline);
  const [ber, beg, beb] = hexToRgb(palette.belly);
  const [pr, pg, pb] = hexToRgb(palette.pupil);

  const cx = W * 0.5, cy = H * 0.52;
  const R = W * 0.34;            // body radius
  const outlineW = W * 0.045;

  // eye
  const eyeX = cx + R * 0.42, eyeY = cy - R * 0.30;
  const eyeR = R * 0.30, pupilR = eyeR * 0.5;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      let r = 0, g = 0, b = 0, a = 0;

      // rounded square background with vertical gradient
      const dxc = Math.abs(x - W / 2), dyc = Math.abs(y - H / 2);
      const half = W / 2 - 1;
      const corner = W * 0.22;
      let inBg = false;
      if (dxc <= half - corner || dyc <= half - corner) inBg = dxc <= half && dyc <= half;
      else {
        const ddx = dxc - (half - corner), ddy = dyc - (half - corner);
        inBg = ddx * ddx + ddy * ddy <= corner * corner;
      }
      if (inBg) {
        const t = y / H;
        r = bg1r + (bg2r - bg1r) * t;
        g = bg1g + (bg2g - bg1g) * t;
        b = bg1b + (bg2b - bg1b) * t;
        a = 255;
      }

      // body circle
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= R) {
        // belly gradient bottom-lighter
        const bt = Math.max(0, Math.min(1, (dy / R) * 0.5 + 0.5));
        r = br + (ber - br) * bt * 0.6;
        g = bg + (beg - bg) * bt * 0.6;
        b = bb + (beb - bb) * bt * 0.6;
        a = 255;
      } else if (dist <= R + outlineW) {
        r = or_; g = og; b = ob; a = 255;
      }

      // eye white
      const edx = x - eyeX, edy = y - eyeY;
      const edist = Math.sqrt(edx * edx + edy * edy);
      if (edist <= eyeR) { r = 255; g = 255; b = 255; a = 255; }
      // pupil (looking toward cursor / up-right)
      const pdx = x - (eyeX + eyeR * 0.25), pdy = y - (eyeY - eyeR * 0.1);
      if (Math.sqrt(pdx * pdx + pdy * pdy) <= pupilR) { r = pr; g = pg; b = pb; a = 255; }

      acc[i] = r; acc[i + 1] = g; acc[i + 2] = b; acc[i + 3] = a;
    }
  }

  // downsample
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const si = ((y * ss + sy) * W + (x * ss + sx)) * 4;
          r += acc[si]; g += acc[si + 1]; b += acc[si + 2]; a += acc[si + 3];
        }
      }
      const n = ss * ss;
      const o = (y * size + x) * 4;
      rgba[o] = Math.round(r / n);
      rgba[o + 1] = Math.round(g / n);
      rgba[o + 2] = Math.round(b / n);
      rgba[o + 3] = Math.round(a / n);
    }
  }
  return encodePng(size, size, rgba);
}

mkdirSync("public/icons", { recursive: true });
for (const s of [16, 32, 48, 128]) {
  writeFileSync(`public/icons/icon-${s}.png`, drawIcon(s));
  console.log(`wrote public/icons/icon-${s}.png`);
}
