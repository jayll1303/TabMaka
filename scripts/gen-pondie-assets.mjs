import { deflateSync, inflateSync } from "node:zlib";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Generate the Pondie Tab icon set from the same frog sprite used by the app.
 * Keeping this deterministic avoids a separate, visually unrelated logo
 * illustration drifting away from the character artwork.
 */

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, "public");
const iconDir = join(publicDir, "icons");
const spritePaths = {
  body: join(publicDir, "sprites", "frog", "frog_body.png"),
  eye: join(publicDir, "sprites", "frog", "eye_open.png"),
  mouth: join(publicDir, "sprites", "frog", "mouth_normal.png"),
};
const SPRITES = {
  body: decodePng(readFileSync(spritePaths.body)),
  eye: decodePng(readFileSync(spritePaths.eye)),
  mouth: decodePng(readFileSync(spritePaths.mouth)),
};
const RENDER_SIZE = 512 * 4;

const colors = {
  pondTop: [23, 63, 60],
  pondBottom: [45, 111, 102],
  lily: [116, 173, 73],
  bubble: [217, 241, 188],
  eyeHighlight: [255, 253, 242],
};

function readChunks(buffer) {
  const chunks = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data });
    offset += 12 + length;
  }
  return chunks;
}

function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) {
    throw new Error("Expected a PNG sprite");
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const bitDepth = buffer[24];
  const colorType = buffer[25];
  const interlace = buffer[28];
  if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
    throw new Error("Sprite must be a non-interlaced 8-bit RGBA PNG");
  }

  const compressed = Buffer.concat(
    readChunks(buffer)
      .filter((chunk) => chunk.type === "IDAT")
      .map((chunk) => chunk.data),
  );
  const raw = inflateSync(compressed);
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const pixels = new Uint8Array(width * height * bytesPerPixel);
  let rawOffset = 0;

  for (let y = 0; y < height; y++) {
    const filter = raw[rawOffset++];
    const rowOffset = y * stride;
    const previousOffset = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const source = raw[rawOffset++];
      const left = x >= bytesPerPixel ? pixels[rowOffset + x - bytesPerPixel] : 0;
      const above = y > 0 ? pixels[previousOffset + x] : 0;
      const upperLeft =
        y > 0 && x >= bytesPerPixel
          ? pixels[previousOffset + x - bytesPerPixel]
          : 0;

      let predictor = 0;
      if (filter === 1) predictor = left;
      if (filter === 2) predictor = above;
      if (filter === 3) predictor = Math.floor((left + above) / 2);
      if (filter === 4) {
        const p = left + above - upperLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - above);
        const pc = Math.abs(p - upperLeft);
        predictor = pa <= pb && pa <= pc ? left : pb <= pc ? above : upperLeft;
      }
      pixels[rowOffset + x] = (source + predictor) & 0xff;
    }
  }

  return { width, height, pixels };
}

function putPixel(pixels, index, color, alpha = 255) {
  const sourceAlpha = alpha / 255;
  const destinationAlpha = pixels[index + 3] / 255;
  const outputAlpha = sourceAlpha + destinationAlpha * (1 - sourceAlpha);
  if (outputAlpha <= 0) return;

  pixels[index] = Math.round(
    (color[0] * sourceAlpha + pixels[index] * destinationAlpha * (1 - sourceAlpha)) /
      outputAlpha,
  );
  pixels[index + 1] = Math.round(
    (color[1] * sourceAlpha +
      pixels[index + 1] * destinationAlpha * (1 - sourceAlpha)) /
      outputAlpha,
  );
  pixels[index + 2] = Math.round(
    (color[2] * sourceAlpha +
      pixels[index + 2] * destinationAlpha * (1 - sourceAlpha)) /
      outputAlpha,
  );
  pixels[index + 3] = Math.round(outputAlpha * 255);
}

function drawEllipse(pixels, cx, cy, rx, ry, color, alpha = 255) {
  const left = Math.max(0, Math.floor(cx - rx));
  const right = Math.min(RENDER_SIZE - 1, Math.ceil(cx + rx));
  const top = Math.max(0, Math.floor(cy - ry));
  const bottom = Math.min(RENDER_SIZE - 1, Math.ceil(cy + ry));
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) {
        putPixel(pixels, (y * RENDER_SIZE + x) * 4, color, alpha);
      }
    }
  }
}

function drawImage(pixels, image, destination) {
  for (let y = 0; y < destination.height; y++) {
    const sourceY = (y / Math.max(1, destination.height - 1)) * (image.height - 1);
    const y0 = Math.floor(sourceY);
    const y1 = Math.min(image.height - 1, y0 + 1);
    const yWeight = sourceY - y0;

    for (let x = 0; x < destination.width; x++) {
      const sourceX = (x / Math.max(1, destination.width - 1)) * (image.width - 1);
      const x0 = Math.floor(sourceX);
      const x1 = Math.min(image.width - 1, x0 + 1);
      const xWeight = sourceX - x0;
      const topIndex = (y0 * image.width + x0) * 4;
      const topRightIndex = (y0 * image.width + x1) * 4;
      const bottomIndex = (y1 * image.width + x0) * 4;
      const bottomRightIndex = (y1 * image.width + x1) * 4;
      const sample = [];

      for (let channel = 0; channel < 4; channel++) {
        const topValue =
          image.pixels[topIndex + channel] * (1 - xWeight) +
          image.pixels[topRightIndex + channel] * xWeight;
        const bottomValue =
          image.pixels[bottomIndex + channel] * (1 - xWeight) +
          image.pixels[bottomRightIndex + channel] * xWeight;
        sample[channel] = Math.round(topValue * (1 - yWeight) + bottomValue * yWeight);
      }

      if (sample[3] > 0) {
        const targetX = Math.round(destination.x + x);
        const targetY = Math.round(destination.y + y);
        putPixel(
          pixels,
          (targetY * RENDER_SIZE + targetX) * 4,
          sample,
          sample[3],
        );
      }
    }
  }
}

function drawSprite(pixels) {
  const body = {
    x: 66 * 4,
    y: 126 * 4,
    width: 380 * 4,
    height: 302 * 4,
  };
  const bodyScale = body.width / SPRITES.body.width;
  const eyeWidth = 63 * 4;
  const eyeHeight = eyeWidth * (SPRITES.eye.height / SPRITES.eye.width);
  const eyeCenterX = body.x + 313.3 * bodyScale;
  const eyeCenterY = body.y + 85.8 * bodyScale;
  const eyeRadius = body.width * (38.8 / 566);

  drawImage(pixels, SPRITES.body, body);
  const eyeDestination = {
    x: eyeCenterX - eyeWidth / 2,
    y: eyeCenterY - eyeHeight / 2,
    width: eyeWidth,
    height: eyeHeight,
  };
  drawImage(pixels, SPRITES.eye, eyeDestination);
  drawEllipse(
    pixels,
    eyeCenterX - eyeRadius * 0.16,
    eyeCenterY - eyeRadius * 0.18,
    eyeRadius * 0.38,
    eyeRadius * 0.38,
    colors.eyeHighlight,
  );
  drawEllipse(
    pixels,
    eyeCenterX + eyeRadius * 0.34,
    eyeCenterY + eyeRadius * 0.32,
    eyeRadius * 0.16,
    eyeRadius * 0.16,
    colors.eyeHighlight,
    230,
  );
  const mouthWidth = body.width * 0.14;
  const mouthHeight = mouthWidth * (SPRITES.mouth.height / SPRITES.mouth.width);
  drawImage(pixels, SPRITES.mouth, {
    x: body.x + 405 * bodyScale - mouthWidth / 2,
    y: body.y + 100 * bodyScale - mouthHeight / 2,
    width: mouthWidth,
    height: mouthHeight,
  });
}

function renderMark() {
  const pixels = new Uint8Array(RENDER_SIZE * RENDER_SIZE * 4);
  const scale = 4;
  const left = 16 * scale;
  const top = 16 * scale;
  const right = 496 * scale;
  const bottom = 496 * scale;
  const radius = 132 * scale;

  for (let y = top; y < bottom; y++) {
    const progress = (y - top) / Math.max(1, bottom - top);
    const pond = [
      Math.round(colors.pondTop[0] + (colors.pondBottom[0] - colors.pondTop[0]) * progress),
      Math.round(colors.pondTop[1] + (colors.pondBottom[1] - colors.pondTop[1]) * progress),
      Math.round(colors.pondTop[2] + (colors.pondBottom[2] - colors.pondTop[2]) * progress),
    ];
    for (let x = left; x < right; x++) {
      const dx = Math.max(left + radius - x, 0, x - (right - radius));
      const dy = Math.max(top + radius - y, 0, y - (bottom - radius));
      if (dx * dx + dy * dy <= radius * radius) {
        putPixel(pixels, (y * RENDER_SIZE + x) * 4, pond);
      }
    }
  }

  drawEllipse(pixels, 256 * scale, 433 * scale, 174 * scale, 38 * scale, colors.lily, 245);
  drawEllipse(pixels, 103 * scale, 111 * scale, 11 * scale, 11 * scale, colors.bubble, 175);
  drawEllipse(pixels, 414 * scale, 142 * scale, 7 * scale, 7 * scale, colors.bubble, 140);
  drawSprite(pixels);
  return pixels;
}

function downsample(source, targetSize) {
  const result = new Uint8Array(targetSize * targetSize * 4);
  const ratio = RENDER_SIZE / targetSize;

  for (let y = 0; y < targetSize; y++) {
    const y0 = Math.floor(y * ratio);
    const y1 = Math.min(RENDER_SIZE, Math.ceil((y + 1) * ratio));
    for (let x = 0; x < targetSize; x++) {
      const x0 = Math.floor(x * ratio);
      const x1 = Math.min(RENDER_SIZE, Math.ceil((x + 1) * ratio));
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;
      let area = 0;

      for (let sourceY = y0; sourceY < y1; sourceY++) {
        for (let sourceX = x0; sourceX < x1; sourceX++) {
          const index = (sourceY * RENDER_SIZE + sourceX) * 4;
          const pixelAlpha = source[index + 3] / 255;
          red += source[index] * pixelAlpha;
          green += source[index + 1] * pixelAlpha;
          blue += source[index + 2] * pixelAlpha;
          alpha += source[index + 3];
          area += 1;
        }
      }

      const outputIndex = (y * targetSize + x) * 4;
      const outputAlpha = alpha / area;
      result[outputIndex] = outputAlpha > 0 ? Math.round(red / (alpha / 255)) : 0;
      result[outputIndex + 1] = outputAlpha > 0 ? Math.round(green / (alpha / 255)) : 0;
      result[outputIndex + 2] = outputAlpha > 0 ? Math.round(blue / (alpha / 255)) : 0;
      result[outputIndex + 3] = Math.round(outputAlpha);
    }
  }

  return result;
}

function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
  }
  return (value ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuffer, data]);
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  checksum.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, checksum]);
}

function encodePng(size, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  const rows = Buffer.alloc((size * 4 + 1) * size);

  for (let y = 0; y < size; y++) {
    rows[y * (size * 4 + 1)] = 0;
    Buffer.from(pixels).copy(rows, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(rows, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function encodeIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const directory = Buffer.alloc(16);
  directory[0] = size === 256 ? 0 : size;
  directory[1] = size === 256 ? 0 : size;
  directory.writeUInt16LE(1, 4);
  directory.writeUInt16LE(32, 6);
  directory.writeUInt32LE(png.length, 8);
  directory.writeUInt32LE(22, 12);
  return Buffer.concat([header, directory, png]);
}

function writeBrandingSvgs(markPng) {
  const markDataUri = `data:image/png;base64,${markPng.toString("base64")}`;
  const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title desc">
  <title id="title">Pondie Tab frog sprite mark</title>
  <desc id="desc">The Pondie Tab frog character sprite on a teal pond background.</desc>
  <image href="${markDataUri}" x="0" y="0" width="512" height="512" preserveAspectRatio="none"/>
</svg>
`;
  const wordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 360" role="img" aria-labelledby="title desc">
  <title id="title">Pondie Tab</title>
  <desc id="desc">Pondie Tab wordmark paired with the production frog character sprite.</desc>
  <rect width="1200" height="360" rx="36" fill="#fffdf6"/>
  <image href="${markDataUri}" x="34" y="34" width="292" height="292" preserveAspectRatio="none"/>
  <text x="382" y="214" font-family="Gaegu, 'Trebuchet MS', sans-serif" font-size="124" font-weight="700" letter-spacing="-4" fill="#173f3c">Pondie</text>
  <text x="798" y="214" font-family="Gaegu, 'Trebuchet MS', sans-serif" font-size="124" font-weight="700" letter-spacing="-4" fill="#78ae49">Tab</text>
  <path d="M397 258c95 24 164 23 236 0 65-20 126-20 191 0" fill="none" stroke="#f39da1" stroke-width="8" stroke-linecap="round" opacity=".8"/>
</svg>
`;
  writeFileSync(join(publicDir, "branding", "pondie-tab-mark.svg"), markSvg);
  writeFileSync(join(publicDir, "branding", "pondie-tab-wordmark.svg"), wordmarkSvg);
}

const renderedMark = renderMark();
const markPng = encodePng(512, downsample(renderedMark, 512));
const outputs = new Map([
  [16, [join(publicDir, "favicon-16x16.png"), join(iconDir, "icon-16.png")]],
  [32, [join(publicDir, "favicon-32x32.png"), join(iconDir, "icon-32.png")]],
  [48, [join(iconDir, "icon-48.png")]],
  [128, [join(iconDir, "icon-128.png")]],
  [180, [join(publicDir, "apple-touch-icon.png")]],
  [192, [join(publicDir, "android-chrome-192x192.png")]],
  [512, [
    join(publicDir, "android-chrome-512x512.png"),
    join(publicDir, "branding", "pondie-tab-mark.png"),
  ]],
]);

mkdirSync(iconDir, { recursive: true });
mkdirSync(join(publicDir, "branding"), { recursive: true });

for (const [size, destinations] of outputs) {
  const png = size === 512 ? markPng : encodePng(size, downsample(renderedMark, size));
  for (const destination of destinations) writeFileSync(destination, png);
}

writeBrandingSvgs(markPng);

writeFileSync(
  join(publicDir, "favicon.ico"),
  encodeIco(encodePng(32, downsample(renderedMark, 32)), 32),
);

console.log(`Generated Pondie Tab sprite-based icon set from ${Object.values(spritePaths).join(", ")}`);
