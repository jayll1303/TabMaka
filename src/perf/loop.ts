/**
 * A rAF loop that can be paused, resumed, and throttled. It stops entirely
 * when told to (hidden tab, reduced motion) and can be capped to a low frame
 * rate while the creature rests. Passes a dtScale (1 at 60fps) to the frame
 * callback for frame-rate independence.
 */
export class Loop {
  private rafId: number | undefined;
  private last = 0;
  private running = false;

  /** Cap on frames per second; null runs at the display refresh rate. */
  maxFps: number | null = null;

  constructor(private frame: (dtScale: number) => void) {}

  get isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }

  private tick = (t: number): void => {
    if (!this.running) return;
    const dt = t - this.last;
    // Throttled: skip ticks until the frame interval has passed. The 2ms of
    // slack keeps vsync jitter from dropping every other eligible frame.
    if (this.maxFps !== null && dt < 1000 / this.maxFps - 2) {
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }
    this.last = t;
    // Clamp to avoid huge jumps after a pause; normalize to 60fps.
    const dtScale = Math.min(dt / (1000 / 60), 3);
    this.frame(dtScale);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
