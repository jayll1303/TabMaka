/**
 * Drives eye-open amount (0 closed, 1 open) with occasional natural blinks.
 * Deterministic when a custom random source is provided (used in tests).
 */
export class Blink {
  private open = 1;
  private nextBlinkAt: number;
  private closing = false;
  private opening = false;

  constructor(
    private now = () => performance.now(),
    _rand?: () => number,
  ) {
    this.nextBlinkAt = this.now() + this.scheduleGap();
  }

  private scheduleGap(): number {
    // Blink every 2 seconds.
    return 2000;
  }

  /** Current eye-open amount [0,1] without advancing state. */
  currentOpen(): number {
    return this.open;
  }

  /** Advance blink state; dtScale is 1 at 60fps. Returns eye-open [0,1]. */
  update(dtScale: number): number {
    const t = this.now();
    const speed = 0.22 * dtScale;

    if (!this.closing && !this.opening && t >= this.nextBlinkAt) {
      this.closing = true;
    }
    if (this.closing) {
      this.open -= speed;
      if (this.open <= 0) {
        this.open = 0;
        this.closing = false;
        this.opening = true;
      }
    } else if (this.opening) {
      this.open += speed;
      if (this.open >= 1) {
        this.open = 1;
        this.opening = false;
        this.nextBlinkAt = t + this.scheduleGap();
      }
    }
    return this.open;
  }
}

