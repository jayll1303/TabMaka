export type Expression =
  | "neutral"
  | "happy"
  | "uwu"
  | "surprised"
  | "sleepy"
  | "tongue"
  | "kiss";

export interface MoodOptions {
  now?: () => number;
  rand?: () => number;
  /** ms a startle (fast approach) reaction holds. */
  startleHold?: number;
  /** ms a poke (click) reaction holds. */
  pokeHold?: number;
  /** ms a gentle-hover reaction holds (refreshed while hovering). */
  petHold?: number;
  /** ms of no interaction before the frog drifts to sleepy. */
  sleepAfter?: number;
}

/** Priority: hover (pet) < click (poke) < drag & drop (startle/surprise). */
const PET_PRIORITY = 1;
const POKE_PRIORITY = 2;
const STARTLE_PRIORITY = 3;

/**
 * Decides which facial expression the frog wears.
 *
 * Baseline is neutral, decaying to sleepy after a long idle. Interaction
 * events (pet / startle / poke) push a timed reaction that holds briefly
 * and then falls back to baseline. Higher-priority reactions win.
 */
export class Mood {
  private reaction: Expression | null = null;
  private reactionUntil = 0;
  private activePriority = 0;
  private lastInteractAt: number;

  private readonly now: () => number;
  private readonly rand: () => number;
  private readonly startleHold: number;
  private readonly pokeHold: number;
  private readonly petHold: number;
  private readonly sleepAfter: number;

  constructor(opts: MoodOptions = {}) {
    this.now = opts.now ?? (() => performance.now());
    this.rand = opts.rand ?? Math.random;
    this.startleHold = opts.startleHold ?? 900;
    this.pokeHold = opts.pokeHold ?? 1200;
    this.petHold = opts.petHold ?? 500;
    this.sleepAfter = opts.sleepAfter ?? 5_000;
    this.lastInteractAt = this.now();
  }

  private reactionActive(t: number): boolean {
    return this.reaction !== null && t < this.reactionUntil;
  }

  /** Any cursor movement; keeps the frog awake. */
  notifyActivity(): void {
    this.lastInteractAt = this.now();
  }

  /** Cursor lingering gently nearby -> content (happy / uwu). */
  pet(): void {
    const t = this.now();
    this.lastInteractAt = t;
    if (this.reactionActive(t) && this.activePriority > PET_PRIORITY) return;
    const stillPetting =
      (this.reaction === "happy" || this.reaction === "uwu") &&
      t < this.reactionUntil;
    const expr: Expression = stillPetting
      ? this.reaction!
      : this.rand() < 0.5
        ? "happy"
        : "uwu";
    this.reaction = expr;
    this.reactionUntil = t + this.petHold;
    this.activePriority = PET_PRIORITY;
  }

  /** Drag & drop -> surprised. */
  startle(): void {
    const t = this.now();
    this.lastInteractAt = t;
    if (this.reactionActive(t) && this.activePriority > STARTLE_PRIORITY) return;
    this.reaction = "surprised";
    this.reactionUntil = t + this.startleHold;
    this.activePriority = STARTLE_PRIORITY;
  }

  /** Click on the frog -> playful (tongue / kiss). */
  poke(): void {
    const t = this.now();
    this.lastInteractAt = t;
    if (this.reactionActive(t) && this.activePriority > POKE_PRIORITY) return;
    this.reaction = this.rand() < 0.5 ? "tongue" : "kiss";
    this.reactionUntil = t + this.pokeHold;
    this.activePriority = POKE_PRIORITY;
  }

  /** The expression to render this frame. */
  current(): Expression {
    const t = this.now();
    if (this.reactionActive(t)) return this.reaction!;
    this.reaction = null;
    this.activePriority = 0;
    const idle = t - this.lastInteractAt;
    if (idle >= this.sleepAfter) return "sleepy";
    return "neutral";
  }

  /** True while a timed reaction is still playing (keeps the loop alive). */
  isBusy(): boolean {
    return this.reactionActive(this.now());
  }
}
