# System Architecture

TabMaka is a Chrome/Edge (Manifest V3) new-tab extension that renders an
interactive kawaii frog on an HTML canvas. This document maps what actually
ships today so humans and AI agents can navigate the code with an accurate
mental model.

> If a claim here ever conflicts with the code, the code wins. Update this file
> when you change the architecture.

## What ships

- A single new-tab page (`index.html`) driven by `src/main.ts`.
- One mascot: the **frog**, a stationary sprite-based character whose eyes and
  expressions react to the cursor, keyboard, clicks, drags, and tab audio.
- A light "shell": clock, editable greeting, ambient background palette,
  first-run onboarding.
- 100% local. The only requested permission is `storage`.

## Tech stack & hard constraints

- **Vanilla TypeScript + Vite.** No runtime UI framework — the new-tab page
  must paint instantly.
- **Canvas 2D**, redrawn each frame from mascot state, scaled for
  `devicePixelRatio`.
- **Performance is a constraint, not a feature.** The rAF loop must stop when
  nothing is animating and when the tab is hidden (~0% CPU idle).
- **Accessibility is a constraint.** Honor `prefers-reduced-motion`: settle to a
  static frame and stop the loop.
- **Privacy is a constraint.** No analytics, telemetry, accounts, or network
  calls. Minimal permissions.

## Directory map

```
src/
  main.ts              # Entry point: wires DOM, input, loop, shell
  storage.ts           # Settings load/save (chrome.storage.local + fallback)
  creatures/           # Data-only mascot configs
    face-types.ts      #   FaceConfig (stationary sprite mascot) — SHIPPED
    frog.ts            #   the frog FaceConfig — SHIPPED
    types.ts           #   CreatureConfig (procedural spine mascot) — DORMANT
    index.ts           #   registry + isFaceConfig() discriminator
  engine/
    mascot.ts          # The Mascot interface (the contract main.ts talks to)
    mascot-factory.ts  # createMascot(): picks FaceMascot vs SpineMascot
    face-mascot.ts     # FaceMascot: frog state + lifecycle + update() — SHIPPED
    frog-render.ts     #   drawFrog() + read-only FrogView — SHIPPED
    frog-eye.ts        #   procedural eye render (pure fns) — SHIPPED
    frog-sprites.ts    #   sprite/asset catalog + geometry helpers — SHIPPED
    blink.ts           # Blink timer (shared)
    mood.ts            # Expression state machine (shared, used by FaceMascot)
    particles.ts       # Floating music notes / bubbles
    audio-detector.ts  # "is any tab audible?" -> vibe animation
    spine.ts skin.ts locomotion.ts behavior.ts  # DORMANT (see below)
    spine-mascot.ts    # SpineMascot — DORMANT
    render.ts          # resizeCanvas() SHIPPED; drawCreature() DORMANT
  perf/
    loop.ts            # Pausable rAF loop (dtScale normalized to 60fps)
    visibility.ts      # Pause/resume on tab visibility
    reduced-motion.ts  # prefers-reduced-motion query + change events
  ui/
    clock.ts           # Clock + greeting + clock-mode toggle
    theme.ts           # Ambient background palette
    editable.ts        # Inline contenteditable helper (greeting)
  styles/              # CSS
```

## Runtime flow

1. New tab opens `index.html`; `main.ts` runs.
2. Load settings (`storage.ts`), apply theme, size the canvas.
3. `createMascot(creatureId, ...)` builds the mascot. `frog` is a `FaceConfig`,
   so this returns a `FaceMascot`.
4. A `Loop` (`perf/loop.ts`) calls `drawFrame(dtScale)` each rAF tick:
   `mascot.update(dtScale, reduced)` then `mascot.draw(ctx, size)`.
5. Input listeners (pointer move/down/up, dblclick, keydown, audio) call mascot
   methods and `wake()` the loop.
6. The loop stops when the tab is hidden, and (under reduced motion) once the
   mascot `isSettled()`.

## The Mascot contract

`engine/mascot.ts` defines the `Mascot` interface — the only surface `main.ts`
depends on. Required: `setCursor`, `setPointerPresent`, `setEnv`, `update`,
`draw`, `isSettled`. Optional (feature-detected with `?.`): `hitTest`,
`startDrag`/`dragTo`/`endDrag`/`isDragging`, `poke`, `jump`, `setVibing`,
`playEntryAnimation`, `triggerTyping`/`isTypingActive`.

Any new mascot implements this interface; `main.ts` never changes.

## The frog mascot (shipped path)

`FaceMascot` was split from one 1000+ line file into four cohesive modules:

- **`face-mascot.ts`** — owns all mutable state and behavior: cursor tracking,
  drag & drop, jump / entrance / typing / vibe animations, and the per-frame
  `update()`. Implements both `Mascot` and `FrogView`.
- **`frog-render.ts`** — `drawFrog(ctx, view)`. Pure rendering; reads state
  through the read-only `FrogView` interface, so it never mutates the mascot.
- **`frog-eye.ts`** — the procedural eye (bead + cursor-tracking glint, or a
  closed "smile" arc) as pure functions.
- **`frog-sprites.ts`** — the art catalog: image loading, jump/vibe/typing
  keyframe tables, mouth sprites, expression→eye maps, and `bodyMetrics()`.

Split rationale: separate mutable state (`face-mascot`) from stateless
rendering (`frog-render`, `frog-eye`) and static data (`frog-sprites`). The
`FrogView` interface exposes only what the renderer reads; the mascot still owns
mutation. `render` and `face-mascot` remain above the 200-line guideline because
each is one cohesive concern (a single render loop / one state object); splitting
further would fragment the render pass or leak mutable state.

## Supporting engine pieces

- **`mood.ts`** — expression FSM (neutral, happy, uwu, surprised, sleepy,
  tongue, kiss) with priorities and an idle drift to sleepy. Fully unit-tested.
- **`blink.ts`** — periodic blink; overridden by expression eye modes.
- **`particles.ts`** — floating music notes (vibe) and bubbles.
- **`audio-detector.ts`** — see below.

## Audio-reactive "vibe"

`audio-detector.ts` calls `chrome.tabs.query({ audible: true })` and listens to
`chrome.tabs.onUpdated`/`onRemoved`/`onActivated`, with a 2.5s poll as a
fallback. When any tab is audible it calls `mascot.setVibing(true)`.

**No `tabs` permission is needed.** Chrome exposes the `audible` boolean and the
`onUpdated` event to any extension; the `tabs` permission only gates sensitive
fields (`url`, `title`, `favIconUrl`, `pendingUrl`), which TabMaka never reads.
Keeping this permission out avoids a scary install-time warning and keeps the
privacy promise literally true. All chrome calls are guarded so the detector is
a no-op outside the extension (e.g. Vite dev, tests).

## Performance & accessibility

- **`perf/loop.ts`** — pausable rAF loop; normalizes delta to `dtScale` (1 at
  60fps, clamped to 3 after long pauses).
- **`perf/visibility.ts`** — stops the loop when the tab is hidden.
- **`perf/reduced-motion.ts`** — reports `prefers-reduced-motion`; under reduced
  motion `update()` snaps rather than eases and the loop stops once settled.

## Storage

`storage.ts` persists `Settings` (creatureId, greeting, clock mode, 12/24h,
background, normalized position, onboarding flag) to `chrome.storage.local`,
falling back to `localStorage` when the API is unavailable. Position is stored
normalized (0..1) so it survives viewport resizes.

## UI shell

`ui/clock.ts` (clock + greeting + clock-mode toggle), `ui/theme.ts` (ambient
palette), `ui/editable.ts` (inline-editable greeting). Wired from `main.ts`
against DOM elements defined in `index.html`.

## Sprite pipeline

Frog sprites in `public/sprites/frog/` are produced by scripts in `scripts/`
(`extract_*.py`, `clean-frog-eye.mjs`). The baked eye bead is removed from the
body PNG so the eye can be drawn in code with full mood control. Pixel anchors
(eye/mouth positions per keyframe) live in `frog-sprites.ts` and are tied to
each sprite's natural dimensions.

## Dormant: the procedural spine engine

The original concept was a procedural creature (spine chain + organic skinning),
implemented in `spine.ts`, `skin.ts`, `locomotion.ts`, `behavior.ts`,
`spine-mascot.ts`, and the `drawCreature()` half of `render.ts`. The product
pivoted to the sprite frog, so this path is **not reachable in the shipped
build**: `createMascot` only returns a `SpineMascot` for a non-`face`
`CreatureConfig`, and the registry (`creatures/index.ts`) contains only the
frog. The code and its tests are kept for a possible future procedural creature.
When reasoning about shipped behavior, ignore this path.

## Testing

Vitest covers pure logic and state machines (`vec`, `spine`, `skin`, `blink`,
`mood`, `behavior`, `particles`, `storage`, `clock`, `theme`, `editable`,
`face-mascot`, `audio-detector`). Rendering (canvas drawing) is not
pixel-tested. Run `npm test`, `npm run build` (type-check + bundle), and
`npm run lint` before committing.

## Adding a new mascot (extension point)

1. Add a config: a `FaceConfig` (stationary sprite, like the frog) or a
   `CreatureConfig` (procedural spine).
2. Register it in `creatures/index.ts` (`mascotConfigs` + `mascotList`).
3. `mascot-factory.ts` already routes `FaceConfig`→`FaceMascot` and everything
   else→`SpineMascot` via `isFaceConfig()`. For a genuinely new render style,
   add a `Mascot` implementation and route to it in the factory.
4. No change to `main.ts` is required — it only knows the `Mascot` interface.
