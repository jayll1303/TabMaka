# TabMaka

TabMaka is an interactive procedural creature that greets you on every new tab. A creature swims after your cursor and wanders on its own when you step away.
100% local, no tracking, no accounts.

Built for Chrome and Edge (Manifest V3). Vanilla TypeScript + Canvas 2D, no
runtime framework, so it loads instantly.

## Features

- Procedural creature animation (spine chain + organic skinning), not hand-drawn sprites
- Head follows the cursor in real time; eyes track the pointer
- Wandering idle behavior when you are not interacting
- Six companions to choose from (eel, fish, snake, tadpole, dog, frog)
- Name your companion and toggle a 12/24h clock
- Settings persisted to `chrome.storage.local` (falls back to `localStorage`)
- Respects `prefers-reduced-motion`: settles to a static frame and stops the loop
- Loop management: animation pauses when the tab is hidden, resumes on demand, so a resting creature costs ~0 CPU

## How it works

The creature is a data config (segment count, radii, palette, eye placement,
follow/wander speeds). A shared procedural engine drives every creature:

- `src/engine/spine.ts` - distance-constrained spine chain that chases a target
- `src/engine/skin.ts` - tangent/normal + bezier hull for an organic outline
- `src/engine/behavior.ts` - follow vs. wander finite-state machine
- `src/engine/render.ts` - Canvas 2D draw, devicePixelRatio aware
- `src/perf/loop.ts` - pausable rAF loop normalized to 60fps

Creature configs live in `src/creatures/`. Add a new one by exporting a
`CreatureConfig` and registering it in `src/creatures/index.ts`.

## Development

Requires Node 18+.

```
npm install      # install dev dependencies
npm run dev      # Vite dev server for the new-tab page
npm test         # run the Vitest unit suite (math, spine, skin, behavior)
npm run build    # type-check + production build into dist/
npm run lint     # eslint
npm run format   # prettier
```

### Load the unpacked extension

1. `npm run build` to produce `dist/` (includes `manifest.json` and `icons/`).
2. Chrome: open `chrome://extensions`, enable Developer mode, click
   "Load unpacked", and select the `dist/` folder.
3. Edge: open `edge://extensions`, enable Developer mode, click
   "Load unpacked", and select the `dist/` folder.
4. Open a new tab to meet your companion.

### Icons

Icons are generated procedurally (no binary art committed by hand):

```
npm run gen:icons   # writes public/icons/icon-{16,32,48,128}.png
```

## Privacy

Everything runs locally in your browser. The only permission requested is
`storage`, used to remember your companion, its name, and clock preference.
No analytics, no network requests, no account. See docs/privacy.md.

## Contributing

Issues and PRs welcome. Keep changes minimal and in the existing style; run
`npm test` and `npm run build` before submitting. New companions are a great
first contribution.

## License

MIT. See LICENSE.
