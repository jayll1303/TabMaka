import type { CreatureConfig } from "../creatures/types";
import {
  type Vec,
  add,
  angle,
  angleDiff,
  clamp,
  fromAngle,
  sub,
} from "./vec";

/**
 * A spine is an ordered list of joints. joints[0] is the head. Each joint is
 * held at a fixed distance from the previous one, and the heading change
 * between adjacent links is clamped so the body cannot fold unnaturally.
 */
export interface Spine {
  joints: Vec[];
  linkDistance: number;
  maxAngle: number;
}

export function createSpine(config: CreatureConfig, origin: Vec): Spine {
  const joints: Vec[] = [];
  for (let i = 0; i < config.segmentCount; i++) {
    joints.push({ x: origin.x - i * config.linkDistance, y: origin.y });
  }
  return {
    joints,
    linkDistance: config.linkDistance,
    maxAngle: config.maxAngle,
  };
}

/**
 * Move the head toward `target` (already stepped by locomotion), then drag each
 * following joint to sit `linkDistance` behind its parent, clamping the heading
 * delta to `maxAngle`.
 */
export function resolveSpine(spine: Spine, head: Vec): void {
  const { joints, linkDistance, maxAngle } = spine;
  joints[0] = head;

  for (let i = 1; i < joints.length; i++) {
    const prev = joints[i - 1];
    const cur = joints[i];
    const desired = angle(sub(cur, prev));

    let heading = desired;
    if (i >= 2) {
      const prevHeading = angle(sub(joints[i - 1], joints[i - 2]));
      const delta = clamp(
        angleDiff(desired, prevHeading),
        -maxAngle,
        maxAngle,
      );
      heading = prevHeading + delta;
    }

    joints[i] = add(prev, fromAngle(heading, linkDistance));
  }
}

/** Heading (radians) at a joint, pointing from the next joint toward it. */
export function headingAt(spine: Spine, index: number): number {
  const { joints } = spine;
  if (index === 0) {
    return angle(sub(joints[0], joints[1]));
  }
  return angle(sub(joints[index - 1], joints[index]));
}
