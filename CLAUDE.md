# TabMaka Developer & Agent Guide

Welcome to **TabMaka** (`jayll1303/TabMaka`). This file contains critical context for engineering and AI agents.

## Architecture & Code Standards

Read [`docs/code-standards.md`](docs/code-standards.md) before making changes.

### Key Rules & Invariants:
1. **Reduced Motion & Animation Lifecycle**:
   - Never wrap `entryProgress`, `jumpProgress`, `landProgress` or `playEntryAnimation()` inside `if (!reduced)`.
   - Never block `loop.start()` on page load with `if (!reduced)`.
   - Continuous idle effects can pause, but finite keyframe transitions must always execute to completion.
   - `isSettled()` must return `false` while transitions are in progress.
2. **Image Loading in Node / Tests**:
   - Use `createImage(src)` helper instead of top-level `new Image()`.
3. **Input Isolation**:
   - Always guard keydown listeners with `isEditableTarget(e.target, document.activeElement)`.

## Verification Commands

- Run unit tests: `npm test`
- Build & Type-check: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`
- Package zip: `npm run zip`
