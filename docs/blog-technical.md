# How I built an interactive new-tab companion (mouse tracking + idle AI) at ~0% idle CPU

_Draft. Part build log, part portfolio piece._

## The gap

New-tab extensions tend to land in one of two camps. Tabby Cat is charming but
static. Momentum is useful but heavy. I wanted something in between: a small
companion that feels alive, reacts to you, and costs almost nothing when it is
just sitting there.

The trick that made it feasible for a solo dev: don't draw art. Generate it.

## Procedural creatures, not sprites

The companion is not a drawn character. It is a data config plus a shared
procedural engine:

- A **spine chain** of joints, each held a fixed distance from the last, with a
  max bend angle. The head chases a target; every other joint follows using a
  distance constraint and `atan2`.
- **Organic skinning** turns that skeleton into a body: for each joint I compute
  a tangent and normal, place left/right hull points, and connect them with
  bezier curves. That gives a smooth, rubbery outline for free.
- Eyes are placed relative to a chosen segment and track the pointer.

Because the body is math, adding a new creature is just a config: segment count,
radii profile, palette, eye placement, follow/wander speeds. Six of them ship
(eel, fish, snake, tadpole, dog, frog) from the same engine.

## Follow vs. wander

Interaction is a small finite-state machine. When the pointer moves, the head
targets the cursor and the creature follows. When you stop, it transitions to a
wandering state, picking gentle targets and drifting around on its own. The two
states share the same spine solver; only the target and speed change.

## The performance story

A per-frame `requestAnimationFrame` loop is the obvious risk for a page you open
constantly. The fix is aggressive loop management:

- The loop is pausable. It **stops entirely** when the creature is idle, when the
  tab is hidden (`visibilitychange`), and resumes on mouse movement or when the
  tab becomes visible again.
- Frame math is normalized to 60fps via a `dtScale`, clamped after a pause so it
  never jumps.
- Canvas is `devicePixelRatio` aware so it stays crisp on Retina without
  over-rendering.

A resting companion on a hidden tab does no work at all.

## Accessibility

`prefers-reduced-motion` is a hard constraint, not an afterthought. When it is
set, the creature settles to a static frame and the loop stops instead of
animating forever. The canvas is `aria-hidden`; the companion is exposed to
assistive tech via a labeled `role="img"`.

## Privacy by construction

The only permission is `storage`, used to remember your companion, its name, and
the clock setting. No analytics, no network requests, no account. Everything
runs locally. That is also the whole single-purpose pitch to the web stores.

## Stack

Vanilla TypeScript + Vite, Canvas 2D, no runtime framework, so the new tab loads
instantly. The production bundle is ~15KB JS (~5.5KB gzipped). Pure math
(vectors, spine, skinning, behavior FSM) is unit-tested with Vitest.

## Try it / read it

- Install: [Chrome Web Store link] / [Edge Add-ons link]
- Source (MIT): [GitHub link]

## GIF ideas for social

- 3-6s loop: cursor chase, then let go and watch it wander.
- Side-by-side of two creatures reacting to the same cursor path.
