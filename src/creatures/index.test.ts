import { describe, it, expect } from "vitest";
import {
  mascotConfigs,
  mascotList,
  defaultMascotId,
  isFaceConfig,
} from "./index";
import { radiusAt } from "./types";

describe("mascot registry", () => {
  it("keys each mascot by its own id", () => {
    for (const [key, c] of Object.entries(mascotConfigs)) {
      expect(c.id).toBe(key);
    }
  });

  it("has a valid default mascot", () => {
    expect(mascotConfigs[defaultMascotId]).toBeDefined();
  });

  it("lists every registered mascot once", () => {
    expect(mascotList.length).toBe(Object.keys(mascotConfigs).length);
    const ids = new Set(mascotList.map((c) => c.id));
    expect(ids.size).toBe(mascotList.length);
  });

  it("defines sane geometry for every spine creature", () => {
    for (const c of mascotList) {
      if (isFaceConfig(c)) {
        expect(c.size).toBeGreaterThan(0);
        expect(c.eye.radius).toBeGreaterThan(0);
        continue;
      }
      expect(c.segmentCount).toBeGreaterThan(2);
      expect(c.linkDistance).toBeGreaterThan(0);
      expect(c.radii.length).toBeGreaterThan(0);
      for (let i = 0; i < c.segmentCount; i++) {
        expect(radiusAt(c, i)).toBeGreaterThan(0);
      }
    }
  });

  it("recognizes face mascots", () => {
    expect(isFaceConfig(mascotConfigs.dog)).toBe(true);
    expect(isFaceConfig(mascotConfigs.frog)).toBe(true);
    expect(isFaceConfig(mascotConfigs.eel)).toBe(false);
  });
});
