import { describe, it, expect } from "vitest";
import { creatures, creatureList, defaultCreatureId } from "./index";
import { radiusAt } from "./types";

describe("creature registry", () => {
  it("keys each creature by its own id", () => {
    for (const [key, c] of Object.entries(creatures)) {
      expect(c.id).toBe(key);
    }
  });

  it("has a valid default creature", () => {
    expect(creatures[defaultCreatureId]).toBeDefined();
  });

  it("lists every registered creature once", () => {
    expect(creatureList.length).toBe(Object.keys(creatures).length);
    const ids = new Set(creatureList.map((c) => c.id));
    expect(ids.size).toBe(creatureList.length);
  });

  it("defines sane geometry for every creature", () => {
    for (const c of creatureList) {
      expect(c.segmentCount).toBeGreaterThan(2);
      expect(c.linkDistance).toBeGreaterThan(0);
      expect(c.radii.length).toBeGreaterThan(0);
      // Radius lookup stays positive across the whole spine.
      for (let i = 0; i < c.segmentCount; i++) {
        expect(radiusAt(c, i)).toBeGreaterThan(0);
      }
    }
  });
});
