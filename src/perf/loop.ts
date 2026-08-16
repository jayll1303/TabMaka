/**
 * A rAF loop that can be paused and resumed. It stops entirely when idle so a
 * resting creature costs ~0 CPU, and resumes on demand (mouse, visibility).
 * Passes a dtScale (1 at 60fps) to the frame callback for frame-rate
 * independence.
 */
export class Loop {
  private rafId: number | undefined;
  private last = 0;
  private running = false;

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
    this.last = t;
    // Clamp to avoid huge jumps after a pause; normalize to 60fps.
    const dtScale = Math.min(dt / (1000 / 60), 3);
    this.frame(dtScale);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
