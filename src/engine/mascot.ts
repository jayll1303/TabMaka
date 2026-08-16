import type { Vec } from "./vec";

export interface Size {
  w: number;
  h: number;
}

/**
 * A mascot is anything that reacts to the cursor and renders itself. Two kinds
 * exist: moving spine creatures (SpineMascot) and stationary characters whose
 * eyes track the cursor (FaceMascot). main.ts stays kind-agnostic.
 */
export interface Mascot {
  /** Cursor moved to this page position. */
  setCursor(pos: Vec): void;
  /** Whether the cursor is currently over the page. */
  setPointerPresent(present: boolean): void;
  /** Viewport size changed. */
  setEnv(size: Size): void;
  /** Advance internal state. dtScale is 1 at 60fps. */
  update(dtScale: number, reduced: boolean): void;
  /** Render onto an already-cleared canvas context. */
  draw(ctx: CanvasRenderingContext2D, size: Size): void;
  /** True when nothing is animating (lets the loop stop under reduced motion). */
  isSettled(): boolean;
}
