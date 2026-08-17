import { describe, it, expect } from "vitest";
import { Mood } from "./mood";

function makeClock(start = 0) {
  let t = start;
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms;
    },
  };
}

describe("Mood state machine", () => {
  it("starts neutral", () => {
    const clock = makeClock(1000);
    const m = new Mood({ now: clock.now, rand: () => 0.5 });
    expect(m.current()).toBe("neutral");
  });

  it("drifts to sleepy after a long idle", () => {
    const clock = makeClock(0);
    const m = new Mood({ now: clock.now, rand: () => 0.5, sleepAfter: 5000 });
    clock.advance(4000);
    expect(m.current()).toBe("neutral");
    clock.advance(1500);
    expect(m.current()).toBe("sleepy");
  });

  it("activity wakes it from sleepy", () => {
    const clock = makeClock(0);
    const m = new Mood({ now: clock.now, rand: () => 0.5, sleepAfter: 5000 });
    clock.advance(6000);
    expect(m.current()).toBe("sleepy");
    m.notifyActivity();
    expect(m.current()).toBe("neutral");
  });

  it("startle shows surprised and then decays back", () => {
    const clock = makeClock(0);
    const m = new Mood({ now: clock.now, rand: () => 0.5, startleHold: 800 });
    m.startle();
    expect(m.current()).toBe("surprised");
    clock.advance(500);
    expect(m.current()).toBe("surprised");
    clock.advance(400);
    expect(m.current()).toBe("neutral");
  });

  it("pet shows a content face (happy/uwu)", () => {
    const clock = makeClock(0);
    const happy = new Mood({ now: clock.now, rand: () => 0.2 });
    happy.pet();
    expect(happy.current()).toBe("happy");

    const uwu = new Mood({ now: clock.now, rand: () => 0.8 });
    uwu.pet();
    expect(uwu.current()).toBe("uwu");
  });

  it("poke shows a playful face (tongue/kiss)", () => {
    const clock = makeClock(0);
    const tongue = new Mood({ now: clock.now, rand: () => 0.2 });
    tongue.poke();
    expect(tongue.current()).toBe("tongue");

    const kiss = new Mood({ now: clock.now, rand: () => 0.8 });
    kiss.poke();
    expect(kiss.current()).toBe("kiss");
  });

  it("poke (high priority) is not overridden by a concurrent pet", () => {
    const clock = makeClock(0);
    const m = new Mood({ now: clock.now, rand: () => 0.2, pokeHold: 1000 });
    m.poke();
    expect(m.current()).toBe("tongue");
    // A gentle hover mid-poke must not stomp the playful reaction.
    m.pet();
    expect(m.current()).toBe("tongue");
  });

  it("startle overrides an active pet", () => {
    const clock = makeClock(0);
    const m = new Mood({ now: clock.now, rand: () => 0.2 });
    m.pet();
    expect(m.current()).toBe("happy");
    m.startle();
    expect(m.current()).toBe("surprised");
  });

  it("isBusy reflects an active reaction window", () => {
    const clock = makeClock(0);
    const m = new Mood({ now: clock.now, rand: () => 0.5, pokeHold: 1000 });
    expect(m.isBusy()).toBe(false);
    m.poke();
    expect(m.isBusy()).toBe(true);
    clock.advance(1100);
    expect(m.isBusy()).toBe(false);
  });
});
