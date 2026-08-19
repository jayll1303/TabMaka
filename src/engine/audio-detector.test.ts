import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AudioDetector } from "./audio-detector";

describe("AudioDetector", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("handles initialization without chrome API gracefully", () => {
    const callback = vi.fn();
    const detector = new AudioDetector(callback);
    expect(detector.getStatus()).toBe(false);
    expect(callback).not.toHaveBeenCalled();
    detector.destroy();
  });

  it("manually toggles and updates status", () => {
    const callback = vi.fn();
    const detector = new AudioDetector(callback);

    detector.setAudible(true);
    expect(detector.getStatus()).toBe(true);
    expect(callback).toHaveBeenCalledWith(true);

    detector.toggle();
    expect(detector.getStatus()).toBe(false);
    expect(callback).toHaveBeenCalledWith(false);

    detector.destroy();
  });

  it("cleans up timer on destroy", () => {
    const callback = vi.fn();
    const detector = new AudioDetector(callback);
    detector.destroy();
    // Advance timers, should not throw
    vi.advanceTimersByTime(5000);
  });
});
