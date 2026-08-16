import { describe, it, expect } from "vitest";
import { createSpine, resolveSpine } from "./spine";
import { buildOutline } from "./skin";
import { radiusAt } from "../creatures/types";
import { dist } from "./vec";
import { eel } from "../creatures/eel";

describe("skin", () => {
  it("produces symmetric left/right borders at the segment radius", () => {
    const spine = createSpine(eel, { x: 200, y: 200 });
    resolveSpine(spine, { x: 260, y: 200 });
    const outline = buildOutline(spine, eel);
    expect(outline.left.length).toBe(spine.joints.length);
    expect(outline.right.length).toBe(spine.joints.length);

    for (let i = 1; i < spine.joints.length - 1; i++) {
      const r = radiusAt(eel, i);
      expect(dist(spine.joints[i], outline.left[i])).toBeCloseTo(r, 3);
      expect(dist(spine.joints[i], outline.right[i])).toBeCloseTo(r, 3);
    }
  });

  it("places nose and tail caps ahead of / behind the body", () => {
    const spine = createSpine(eel, { x: 200, y: 200 });
    resolveSpine(spine, { x: 260, y: 200 });
    const outline = buildOutline(spine, eel);
    // Nose is in front of head (greater x when moving +x).
    expect(outline.nose.x).toBeGreaterThan(spine.joints[0].x);
    // Tail cap is behind the last joint.
    const last = spine.joints.length - 1;
    expect(outline.tail.x).toBeLessThan(spine.joints[last].x);
  });
});
