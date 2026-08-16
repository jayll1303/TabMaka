import type { CreatureConfig } from "./types";

/**
 * Build a tapered body profile: small at the snout, widest a bit behind the
 * head, then easing down to a thin tail. Values are hand-tuned radii in px.
 */
function eelProfile(count: number): number[] {
  const radii: number[] = [];
  const peak = 22;
  const peakAt = Math.round(count * 0.18);
  for (let i = 0; i < count; i++) {
    let r: number;
    if (i <= peakAt) {
      const t = i / Math.max(1, peakAt);
      r = 10 + (peak - 10) * t;
    } else {
      const t = (i - peakAt) / Math.max(1, count - 1 - peakAt);
      r = peak * (1 - t) + 3 * t;
    }
    radii.push(Math.max(3, r));
  }
  return radii;
}

const SEGMENTS = 28;

export const eel: CreatureConfig = {
  id: "eel",
  name: "Eel",
  segmentCount: SEGMENTS,
  linkDistance: 16,
  radii: eelProfile(SEGMENTS),
  maxAngle: Math.PI / 8,
  palette: {
    body: "#5b8dd9",
    outline: "#2f4d80",
    belly: "#a9c8f0",
    eye: "#ffffff",
    pupil: "#12203a",
  },
  eyes: {
    segment: 1,
    offset: 9,
    radius: 5,
    pupilRadius: 2.4,
  },
  followSpeed: 7,
  wanderSpeed: 2.4,
};

export const creatures: Record<string, CreatureConfig> = {
  eel,
};

export const defaultCreatureId = "eel";
