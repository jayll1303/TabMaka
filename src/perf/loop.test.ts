import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Loop } from "./loop";

describe("Loop", () => {
  let pending: ((t: number) => void) | undefined;
  let now = 0;

  /** Advance the clock and fire the queued animation frame. */
  function tick(ms: number): void {
    now += ms;
    const cb = pending;
    pending = undefined;
    cb?.(now);
  }

  beforeEach(() => {
    now = 0;
    pending = undefined;
    vi.stubGlobal("performance", { now: () => now });
    vi.stubGlobal("requestAnimationFrame", (cb: (t: number) => void) => {
      pending = cb;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {
      pending = undefined;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("runs every frame by default", () => {
    const frame = vi.fn();
    const loop = new Loop(frame);
    loop.start();
    for (let i = 0; i < 6; i++) tick(1000 / 60);
    expect(frame).toHaveBeenCalledTimes(6);
  });

  it("skips frames when capped and reports the full elapsed time", () => {
    const frame = vi.fn();
    const loop = new Loop(frame);
    loop.maxFps = 20;
    loop.start();
    for (let i = 0; i < 6; i++) tick(1000 / 60);
    expect(frame).toHaveBeenCalledTimes(2);
    expect(frame.mock.calls[0][0]).toBeCloseTo(3);
  });

  it("returns to full rate when the cap is lifted", () => {
    const frame = vi.fn();
    const loop = new Loop(frame);
    loop.maxFps = 20;
    loop.start();
    loop.maxFps = null;
    for (let i = 0; i < 3; i++) tick(1000 / 60);
    expect(frame).toHaveBeenCalledTimes(3);
  });

  it("stops calling the frame after stop()", () => {
    const frame = vi.fn();
    const loop = new Loop(frame);
    loop.start();
    tick(16);
    loop.stop();
    tick(16);
    expect(frame).toHaveBeenCalledTimes(1);
    expect(loop.isRunning).toBe(false);
  });
});
