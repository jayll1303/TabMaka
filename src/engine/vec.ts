export interface Vec {
  x: number;
  y: number;
}

export function vec(x: number, y: number): Vec {
  return { x, y };
}

export function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(a: Vec, s: number): Vec {
  return { x: a.x * s, y: a.y * s };
}

export function len(a: Vec): number {
  return Math.hypot(a.x, a.y);
}

export function dist(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalize(a: Vec): Vec {
  const l = len(a);
  if (l === 0) return { x: 0, y: 0 };
  return { x: a.x / l, y: a.y / l };
}

/** Left-hand normal (perpendicular) of a vector. */
export function normal(a: Vec): Vec {
  return { x: -a.y, y: a.x };
}

export function angle(a: Vec): number {
  return Math.atan2(a.y, a.x);
}

export function fromAngle(theta: number, r = 1): Vec {
  return { x: Math.cos(theta) * r, y: Math.sin(theta) * r };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Linear interpolation between a and b by t in [0,1]. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVec(a: Vec, b: Vec, t: number): Vec {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

/**
 * Wrap an angle difference into [-PI, PI]. Useful for constraining the delta
 * between two heading angles.
 */
export function angleDiff(target: number, source: number): number {
  let d = target - source;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
