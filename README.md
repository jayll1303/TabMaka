# TabMaka

TabMaka is an interactive companion that greets you on every new tab. An adorable kawaii frog loaf companion that tracks your cursor with its eyes, reacts to clicks, and can be placed anywhere on your screen.
100% local, no tracking, no accounts.

Built for Chrome and Edge (Manifest V3). Vanilla TypeScript + Canvas 2D, no runtime framework, loads instantly.

## Features

- **Interactive Kawaii Frog Mascot**: Doodle loaf with real-time cursor-following eye tracking, expressive blinking, and natural breathing.
- **Drag & Drop & Poke**: Place your companion anywhere on the screen by dragging, or click/poke for a playful bounce.
- **Ambient Themes**: Switch between soothing pastel backgrounds via the bottom-left color palette.
- **Clock & Greeting**: 3-state clock toggle (12h, 24h, hidden) and customizable greeting message.
- **Privacy First**: 100% local. Settings persisted to `chrome.storage.local` (with `localStorage` fallback). No analytics, telemetry, or network calls.
- **Accessible & Efficient**: Respects `prefers-reduced-motion` and pauses the animation loop when the tab is hidden, costing ~0% CPU when idle.

## Development

Requires Node 18+.

```bash
npm install      # install dev dependencies
npm run dev      # Vite dev server for the new-tab page
npm test         # run Vitest unit suite
npm run build    # type-check + production build into dist/
npm run lint     # eslint
npm run format   # prettier
```

### Load the unpacked extension

1. `npm run build` to produce `dist/` (includes `manifest.json` and `icons/`).
2. Chrome: open `chrome://extensions`, enable Developer mode, click "Load unpacked", and select the `dist/` folder.
3. Edge: open `edge://extensions`, enable Developer mode, click "Load unpacked", and select the `dist/` folder.
4. Open a new tab to meet your companion.

## Privacy

Everything runs locally in your browser. The only permission requested is `storage`, used solely to remember your frog's position, custom greeting, background theme, and clock preferences. No analytics, no network requests, no accounts. See [docs/privacy.md](docs/privacy.md).

## Contributing

Issues and PRs welcome. Run `npm test` and `npm run build` before submitting.

## License

MIT. See [LICENSE](LICENSE).

