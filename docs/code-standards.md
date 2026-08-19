# TabMaka Engineering & Architecture Standards

This document establishes the architectural principles, animation lifecycle rules, and coding standards for **TabMaka**. Every contributor and AI agent must adhere to these standards.

---

## 1. Core Architectural Principles

- **Zero Bloat, Zero Telemetry**: TabMaka runs 100% locally with vanilla TypeScript + Canvas 2D. No frontend framework runtime (no React/Vue) on the new-tab surface.
- **~0% Idle CPU**: The `requestAnimationFrame` loop automatically sleeps when the mascot is settled or when the tab is hidden (`visibilitychange`).
- **Instant Cold Start**: The new tab must render its first frame within milliseconds.

---

## 2. Animation Lifecycle & Reduced-Motion Contract (CRITICAL)

> ⚠️ **CRITICAL LESSON LEARNED**:
> Many operating systems (particularly Windows 10/11 when "Animation effects" is disabled in Accessibility settings) report `(prefers-reduced-motion: reduce)` as `true` by default.
> **DO NOT** gate finite animations or loop initialization with `if (!reduced)`.

### Distinction: Finite Transitions vs Continuous Idle Effects

| Animation Category | Examples | Reduced Motion Behavior | Rule |
| :--- | :--- | :--- | :--- |
| **Finite Transitions** | Entry Jump, Click Hop, Land Squash, Drag Drop | **MUST ALWAYS RUN & COMPLETE** | **Never gate with `if (!reduced)`**. The mascot must not freeze mid-air or fail to enter. |
| **Continuous Idle Effects** | Idle breathing, eye blinking, perpetual music particles | Can pause/relax when idle | Safe to gate or sleep once mascot is settled into loaf. |

### The 4 Invariants of the Render Loop:

1. **Always start the loop on page load**:
   ```ts
   // ✅ CORRECT: In src/main.ts
   drawFrame(1);
   loop.start();

   // ❌ WRONG: Do NOT do this:
   if (!reduced) loop.start(); // -> Freezes cold start on Windows
   ```

2. **Always initialize entrance transitions**:
   ```ts
   // ✅ CORRECT: In FaceMascot constructor
   this.playEntryAnimation();

   // ❌ WRONG: Do NOT do this:
   if (!reduced) this.playEntryAnimation();
   ```

3. **Advance all progress transitions regardless of `reduced`**:
   ```ts
   // ✅ CORRECT: In FaceMascot.update(dtScale, reduced)
   if (this.entryProgress >= 0) {
     this.entryProgress += dtMs / this.entryDuration;
     // ... completes and resets to -1
   }
   if (this.jumpProgress >= 0) {
     this.jumpProgress += dtMs / this.jumpDuration;
     // ... completes and resets to -1
   }
   if (this.landProgress >= 0) {
     this.landProgress += dtMs / this.landDuration;
     // ... completes and resets to -1
   }
   ```

4. **`isSettled()` Contract**:
   `isSettled()` must return `false` as long as any transition is active (`entryProgress >= 0 || jumpProgress >= 0 || landProgress >= 0 || dragging`).
   Only when `isSettled()` returns `true` and `reduced` is active does `drawFrame()` pause the loop:
   ```ts
   if (reduced && mascot.isSettled()) {
     loop.stop();
   }
   ```

---

## 3. Node / Vitest Compatibility for Canvas & Images

Top-level `new Image()` instantiations will throw `ReferenceError: Image is not defined` in Vitest (Node.js test environment).

Always use the safe `createImage` helper:
```ts
function createImage(src: string): HTMLImageElement {
  if (typeof Image !== "undefined") {
    const img = new Image();
    img.src = src;
    return img;
  }
  return { src, complete: false, naturalWidth: 0, naturalHeight: 0 } as HTMLImageElement;
}
```

---

## 4. Keyboard Shortcuts & Input Isolation

When adding global keyboard shortcuts (`Space`, `M`, `E`, etc.):
- **Always** guard with `isEditableTarget(e.target, document.activeElement)` to prevent global keypresses from triggering mascot actions when the user is typing in inputs, textareas, or contenteditable elements (e.g. custom greeting).

```ts
window.addEventListener("keydown", (e) => {
  if (isEditableTarget(e.target, document.activeElement)) return;
  // Handle shortcut...
});
```

---

## 5. Quality Gates & Release Verification

Before committing and releasing:
1. `npm test` - All Vitest unit suites must pass (including mascot physics & editable checks).
2. `npm run build` - TypeScript type checking (`tsc --noEmit`) and Vite bundle build.
3. `npm run lint` - ESLint check with zero errors.
4. `npm run format` - Prettier code formatting.
5. Version bumping must be synchronized across `package.json`, `manifest.json`, and `CHANGELOG.md`.
