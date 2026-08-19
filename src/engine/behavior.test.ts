import { describe, it, expect } from "vitest";
import { Behavior } from "./behavior";

function makeClock(start = 0) {
  let t = start;
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms;
    },
  };
}

describe("behavior FSM", () => {
  it("wakes to FOLLOWING on mouse and targets the mouse", () => {
    const clock = makeClock(10_000);
    const b = new Behavior(
      { width: 800, height: 600 },
      { x: 100, y: 100 },
      {
        now: clock.now,
        rand: () => 0.5,
      },
    );
    b.notifyMouse({ x: 400, y: 300 });
    expect(b.state).toBe("FOLLOWING");
    const r = b.update({ x: 100, y: 100 });
    expect(r.state).toBe("FOLLOWING");
    expect(r.target).toEqual({ x: 400, y: 300 });
  });

  it("leaves FOLLOWING for WANDERING after idle delay", () => {
    const clock = makeClock(10_000);
    const b = new Behavior(
      { width: 800, height: 600 },
      { x: 100, y: 100 },
      {
        idleDelay: 2000,
        now: clock.now,
        rand: () => 0.5,
      },
    );
    b.notifyMouse({ x: 400, y: 300 });
    clock.advance(2500);
    const r = b.update({ x: 400, y: 300 });
    expect(r.state).toBe("WANDERING");
  });

  it("rests on arrival then wanders again", () => {
    const clock = makeClock(0);
    const b = new Behavior(
      { width: 800, height: 600 },
      { x: 100, y: 100 },
      {
        restDuration: 1000,
        arriveRadius: 30,
        now: clock.now,
        rand: () => 0.5,
      },
    );
    // Force into WANDERING with a known target near the head.
    b.notifyMouse({ x: 100, y: 100 });
    clock.advance(5000);
    b.update({ x: 100, y: 100 }); // -> WANDERING, target = center-ish
    const target = b.update({ x: 100, y: 100 }).target;
    // Arrive at the target.
    const arrive = b.update({ x: target.x, y: target.y });
    expect(arrive.state).toBe("RESTING");
    // Still resting before duration elapses.
    clock.advance(500);
    expect(b.update({ x: target.x, y: target.y }).state).toBe("RESTING");
    // Wanders again after rest.
    clock.advance(600);
    expect(b.update({ x: target.x, y: target.y }).state).toBe("WANDERING");
  });

  it("keeps wander targets inside the environment margins", () => {
    const clock = makeClock(0);
    const b = new Behavior(
      { width: 800, height: 600 },
      { x: 100, y: 100 },
      {
        now: clock.now,
        rand: () => 0,
      },
    );
    b.notifyMouse({ x: 100, y: 100 });
    clock.advance(5000);
    const r = b.update({ x: 100, y: 100 });
    expect(r.target.x).toBeGreaterThanOrEqual(80);
    expect(r.target.y).toBeGreaterThanOrEqual(80);
  });
});
