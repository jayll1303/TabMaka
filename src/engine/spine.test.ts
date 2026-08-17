import { describe, it, expect } from "vitest";
import { createSpine, resolveSpine } from "./spine";
import { dist } from "./vec";
import { tadpole } from "../creatures/tadpole";

describe("spine", () => {
  it("creates the configured number of joints", () => {
    const spine = createSpine(tadpole, { x: 100, y: 100 });
    expect(spine.joints.length).toBe(tadpole.segmentCount);
  });

  it("keeps a fixed link distance after resolving", () => {
    const spine = createSpine(tadpole, { x: 100, y: 100 });
    resolveSpine(spine, { x: 300, y: 220 });
    for (let i = 1; i < spine.joints.length; i++) {
      const d = dist(spine.joints[i - 1], spine.joints[i]);
      expect(d).toBeCloseTo(tadpole.linkDistance, 4);
    }
  });

  it("clamps heading change between adjacent links", () => {
    const spine = createSpine(tadpole, { x: 100, y: 100 });
    // Yank the head sharply many times; body must not exceed maxAngle per link.
    for (let step = 0; step < 20; step++) {
      resolveSpine(spine, { x: 100 + step, y: 100 + step * 8 });
    }
    for (let i = 2; i < spine.joints.length; i++) {
      const a = Math.atan2(
        spine.joints[i - 2].y - spine.joints[i - 1].y,
        spine.joints[i - 2].x - spine.joints[i - 1].x,
      );
      const b = Math.atan2(
        spine.joints[i - 1].y - spine.joints[i].y,
        spine.joints[i - 1].x - spine.joints[i].x,
      );
      let delta = Math.abs(b - a);
      while (delta > Math.PI) delta = Math.abs(delta - Math.PI * 2);
      expect(delta).toBeLessThanOrEqual(tadpole.maxAngle + 1e-6);
    }
  });
});
