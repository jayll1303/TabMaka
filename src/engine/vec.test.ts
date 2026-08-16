import { describe, it, expect } from "vitest";
import {
  add,
  angle,
  angleDiff,
  clamp,
  dist,
  fromAngle,
  lerp,
  normalize,
  sub,
} from "./vec";

describe("vec", () => {
  it("adds and subtracts", () => {
    expect(add({ x: 1, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 4, y: 6 });
    expect(sub({ x: 3, y: 4 }, { x: 1, y: 2 })).toEqual({ x: 2, y: 2 });
  });

  it("normalizes and guards zero-length", () => {
    expect(normalize({ x: 3, y: 0 })).toEqual({ x: 1, y: 0 });
    expect(normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it("computes distance", () => {
    expect(dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it("angle and fromAngle round-trip", () => {
    const a = angle({ x: 0, y: 1 });
    expect(a).toBeCloseTo(Math.PI / 2);
    const v = fromAngle(Math.PI, 2);
    expect(v.x).toBeCloseTo(-2);
    expect(v.y).toBeCloseTo(0);
  });

  it("clamps", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
  });

  it("lerps", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it("wraps angle difference into [-PI, PI]", () => {
    expect(angleDiff(Math.PI * 1.5, 0)).toBeCloseTo(-Math.PI / 2);
    expect(angleDiff(-Math.PI * 1.5, 0)).toBeCloseTo(Math.PI / 2);
  });
});
