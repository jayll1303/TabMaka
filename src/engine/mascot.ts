import type { Vec } from "./vec";

export interface Size {
  w: number;
  h: number;
  /** A tap/click landed on the mascot. */
  poke?(): void;
}

/**
 * A mascot is anything that reacts to the cursor and renders itself.
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

  /** Hit test for clicking/dragging on the mascot. */
  hitTest?(pos: Vec): boolean;
  /** Start dragging the mascot. */
  startDrag?(pos: Vec): void;
  /** Drag mascot to a new screen coordinate. */
  dragTo?(pos: Vec): void;
  /** End drag and return normalized screen position (0..1). */
  endDrag?(): Vec;
  /** Check if mascot is currently being dragged. */
  isDragging?(): boolean;
  /** A tap/click landed on the mascot. */
  poke?(): void;
  /** Trigger a jump animation on the mascot. */
  jump?(): void;
  /** Toggle or set listening to music / vibe state. */
  setVibing?(vibing: boolean): void;
}

