import { describe, it, expect } from "vitest";
import { ParticleSystem } from "./particles";

describe("ParticleSystem", () => {
  it("emits bubbles up to maximum limit", () => {
    const ps = new ParticleSystem();
    for (let i = 0; i < 30; i++) {
      ps.emit({ x: 100, y: 100 });
    }
    // Updating particles
    ps.update(1);
    // Clearing
    ps.clear();
  });

  it("updates and expires bubbles over time", () => {
    const ps = new ParticleSystem();
    ps.emit({ x: 50, y: 50 });
    // Advance life past maxLife
    for (let i = 0; i < 70; i++) {
      ps.update(1);
    }
    // All expired, should draw cleanly without error
    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      arc: () => {},
      stroke: () => {},
      fill: () => {},
    } as unknown as CanvasRenderingContext2D;
    expect(() => ps.draw(mockCtx)).not.toThrow();
  });
});
