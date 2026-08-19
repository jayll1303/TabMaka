import type { CreatureConfig } from "../creatures/types";
import { radiusAt } from "../creatures/types";
import { type Vec, add, angle, normalize, scale, sub } from "./vec";
import type { Spine } from "./spine";

export interface Outline {
  /** Border points down the left side (head -> tail). */
  left: Vec[];
  /** Border points down the right side (head -> tail). */
  right: Vec[];
  /** Rounded nose cap point (in front of the head). */
  nose: Vec;
  /** Rounded tail cap point (behind the tail). */
  tail: Vec;
}

/**
 * For each joint, offset perpendicular to the local heading by the segment
 * radius, producing the left/right border points that skinning connects into a
 * smooth hull.
 */
export function buildOutline(spine: Spine, config: CreatureConfig): Outline {
  const { joints } = spine;
  const left: Vec[] = [];
  const right: Vec[] = [];

  for (let i = 0; i < joints.length; i++) {
    const here = joints[i];
    const next = joints[Math.min(i + 1, joints.length - 1)];
    const prev = joints[Math.max(i - 1, 0)];
    const dir = normalize(sub(next, prev));
    const perp = { x: -dir.y, y: dir.x };
    const r = radiusAt(config, i);
    left.push(add(here, scale(perp, r)));
    right.push(add(here, scale(perp, -r)));
  }

  const headDir = normalize(sub(joints[0], joints[1]));
  const nose = add(joints[0], scale(headDir, radiusAt(config, 0)));

  const lastIndex = joints.length - 1;
  const tailDir = normalize(sub(joints[lastIndex], joints[lastIndex - 1]));
  const tail = add(
    joints[lastIndex],
    scale(tailDir, radiusAt(config, lastIndex)),
  );

  return { left, right, nose, tail };
}

/** Heading of the head joint, for placing eyes. */
export function headAngle(spine: Spine): number {
  return angle(sub(spine.joints[0], spine.joints[1]));
}
