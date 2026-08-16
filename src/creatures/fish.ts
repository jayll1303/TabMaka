import type { CreatureConfig } from "./types";
import { taperedProfile } from "./profile";

const SEGMENTS = 12;

/**
 * Short, plump body: small snout, wide belly, quick taper to a little tail.
 * Fewer, longer segments so it reads as a stocky fish rather than a ribbon.
 */
export const fish: CreatureConfig = {
  id: "fish",
  name: "Fish",
  segmentCount: SEGMENTS,
  linkDistance: 18,
  radii: taperedProfile(SEGMENTS, { head: 14, peak: 30, peakFrac: 0.3, tail: 4 }),
  maxAngle: Math.PI / 6,
  palette: {
    body: "#f2994a",
    outline: "#a85b18",
    belly: "#ffd8a8",
    eye: "#ffffff",
    pupil: "#1a1a1a",
  },
  eyes: { segment: 1, offset: 12, radius: 6, pupilRadius: 3 },
  followSpeed: 8,
  wanderSpeed: 2.8,
};
