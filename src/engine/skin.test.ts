import { describe, it, expect } from "vitest";
import { createSpine, resolveSpine } from "./spine";
import { buildOutline } from "./skin";
import { radiusAt, type CreatureConfig } from "../creatures/types";
import { dist } from "./vec";

const mockCreature: CreatureConfig = {
  id: "mock",
  name: "Mock",
  segmentCount: 16,
  linkDistance: 12,
  radii: [25, 27, 20, 15, 10, 5, 2],
  maxAngle: Math.PI / 5,
  palette: { body: "#000", outline: "#000", belly: "#000", eye: "#000", pupil: "#000" },
  eyes: { segment: 1, offset: 12, radius: 6, pupilRadius: 3 },
  followSpeed: 8,
  wanderSpeed: 3,
};

describe("skin", () => {
  it("produces symmetric left/right borders at the segment radius", () => {
    const spine = createSpine(mockCreature, { x: 200, y: 200 });
    resolveSpine(spine, { x: 260, y: 200 });
    const outline = buildOutline(spine, mockCreature);
    expect(outline.left.length).toBe(spine.joints.length);
    expect(outline.right.length).toBe(spine.joints.length);

    for (let i = 1; i < spine.joints.length - 1; i++) {
      const r = radiusAt(mockCreature, i);
      expect(dist(spine.joints[i], outline.left[i])).toBeCloseTo(r, 3);
      expect(dist(spine.joints[i], outline.right[i])).toBeCloseTo(r, 3);
    }
  });

  it("places nose and tail caps ahead of / behind the body", () => {
    const spine = createSpine(mockCreature, { x: 200, y: 200 });
    resolveSpine(spine, { x: 260, y: 200 });
    const outline = buildOutline(spine, mockCreature);
    // Nose is in front of head (greater x when moving +x).
    expect(outline.nose.x).toBeGreaterThan(spine.joints[0].x);
    // Tail cap is behind the last joint.
    const last = spine.joints.length - 1;
    expect(outline.tail.x).toBeLessThan(spine.joints[last].x);
  });
});
