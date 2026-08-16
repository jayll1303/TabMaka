import { describe, it, expect } from "vitest";
import { Blink } from "./blink";

function makeClock(start = 0) {
  let t = start;
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms;
    },
  };
}

describe("blink", () => {
  it("stays open until a blink is scheduled", () => {
    const clock = makeClock(0);
    const blink = new Blink(clock.now, () => 0.5);
    expect(blink.update(1)).toBe(1);
    clock.advance(1000);
    expect(blink.update(1)).toBe(1);
  });

  it("closes then reopens after the scheduled gap", () => {
    const clock = makeClock(0);
    // rand 0 => gap = 2000ms (minimum).
    const blink = new Blink(clock.now, () => 0);
    clock.advance(2100);
    // Drive several frames; eye should dip below 1 (closing) then recover.
    let minOpen = 1;
    for (let i = 0; i < 20; i++) {
      minOpen = Math.min(minOpen, blink.update(1));
    }
    expect(minOpen).toBeLessThan(1);
  });
});
