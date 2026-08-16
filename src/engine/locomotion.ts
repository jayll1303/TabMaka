import { type Vec, dist, normalize, scale, add } from "./vec";

/**
 * Step a point toward a target by at most `speed` px this frame, scaled by
 * `dtScale` (1 at 60fps). Returns the new position; if within reach, snaps to
 * the target.
 */
export function stepToward(
  from: Vec,
  target: Vec,
  speed: number,
  dtScale: number,
): Vec {
  const d = dist(from, target);
  const maxStep = speed * dtScale;
  if (d <= maxStep || d === 0) return { ...target };
  const dir = normalize({ x: target.x - from.x, y: target.y - from.y });
  return add(from, scale(dir, maxStep));
}
