import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/**
 * Build the shipped frog sprites from the PNG masters.
 *
 * Masters live in `art/sprites/frog/` (never bundled). Each one is capped to
 * MAX_WIDTH and written as WebP into `public/sprites/frog/`, which is what the
 * extension loads. `reference/` holds source art that is not shipped.
 *
 * The renderer positions sprites from the master pixel dimensions recorded in
 * `src/engine/frog-sprites.ts`, so downscaling here needs no code change as
 * long as the aspect ratio is preserved.
 */

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(root, "art", "sprites", "frog");
const outDir = join(root, "public", "sprites", "frog");

// The largest sprite is drawn ~305 CSS px wide, so 650 px stays crisp at 2x.
const MAX_WIDTH = 650;

function listPngs(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name !== "reference") found.push(...listPngs(full));
    } else if (name.endsWith(".png")) {
      found.push(full);
    }
  }
  return found;
}

rmSync(outDir, { recursive: true, force: true });

let totalIn = 0;
let totalOut = 0;
for (const file of listPngs(srcDir)) {
  const out = join(outDir, relative(srcDir, file)).replace(/\.png$/, ".webp");
  mkdirSync(dirname(out), { recursive: true });
  await sharp(file)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(out);
  totalIn += statSync(file).size;
  totalOut += statSync(out).size;
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log(`Sprites: ${kb(totalIn)} PNG -> ${kb(totalOut)} WebP`);
