import { describe, it, expect } from "vitest";
import { Fly } from "./fly";

describe("Fly Entity", () => {
  it("initializes at specified position and buzzing state", () => {
    const fly = new Fly({ x: 300, y: 200 }, 1.5);
    expect(fly.state).toBe("buzzing");
    expect(fly.pos.x).toBe(300);
    expect(fly.pos.y).toBe(200);
    expect(fly.timer).toBe(1.5);
  });

  it("updates position with gentle wobble and decrements timer", () => {
    const fly = new Fly({ x: 300, y: 200 }, 1.0);
    fly.update(30); // half second at 60fps (30 frames)
    expect(fly.timer).toBeCloseTo(0.5, 1);
    expect(fly.state).toBe("buzzing");
  });

  it("transitions to targeted when timer expires", () => {
    const fly = new Fly({ x: 300, y: 200 }, 0.5);
    fly.update(35); // over 0.5s
    expect(fly.state).toBe("targeted");
  });

  it("supports multiple bug species", () => {
    const ladybug = new Fly({ x: 100, y: 100 }, 1, "ladybug");
    expect(ladybug.species).toBe("ladybug");

    const bee = new Fly({ x: 100, y: 100 }, 1, "bee");
    expect(bee.species).toBe("bee");

    const firefly = new Fly({ x: 100, y: 100 }, 1, "firefly");
    expect(firefly.species).toBe("firefly");
  });
});
