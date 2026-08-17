# Store Assets Checklist

Prepare these before submitting. Reuse the in-product companion for a
consistent look.

## Icon (done)

- 128x128 store icon: use `public/icons/icon-128.png` (generated via `npm run gen:icons`).
- Manifest icons (16/32/48/128) are already wired in `manifest.json`.

## Screenshots

Chrome Web Store: 1280x800 or 640x400 PNG/JPEG, 1-5 images.
Edge Add-ons: 1280x800 PNG recommended, up to 10 images.

Shot list:
1. Hero: companion mid-follow, cursor visible, clock shown.
2. Idle: companion wandering, no cursor.
3. Settings panel open showing the companion picker and name field.
4. A different companion (e.g., fish or frog) for variety.

## Promotional / hero GIF (optional but high-impact)

- Short (3-6s) loop of the companion following the cursor, then wandering.
- Use as the primary marketing image on social and in the README.
- Keep under a few MB; trim to the "wow" moment (cursor chase).

## Promo tiles (Chrome, optional)

- Small promo tile: 440x280 PNG/JPEG.
- Marquee: 1400x560 PNG/JPEG.

## How to capture

1. `npm run build` and load `dist/` unpacked (see README).
2. Open a new tab, move the cursor to trigger follow, then hold still to see wandering.
3. Capture at 1280x800. Save PNGs into this folder before uploading.
