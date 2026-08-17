import type { CreatureConfig } from "./types";
import { taperedProfile } from "./profile";

const SEGMENTS = 16;

/**
 * Chubby, rounded head with a soft tapering tail, dreamy Ghibli watercolor
 * palette, rosy cheeks, translucent silk fin, and sparkly anime eyes.
 */
export const tadpole: CreatureConfig = {
  id: "tadpole",
  name: "Tadpole",
  segmentCount: SEGMENTS,
  linkDistance: 12,
  radii: taperedProfile(SEGMENTS, { head: 25, peak: 27, peakFrac: 0.05, tail: 2 }),
  maxAngle: Math.PI / 5,
  palette: {
    body: "#9c6ade",
    outline: "#3b2b4d",
    belly: "#f5e6ff",
    eye: "#fcfaf4",
    pupil: "#1c142b",
    blush: "rgba(244, 114, 182, 0.45)",
    fin: "rgba(216, 180, 254, 0.4)",
    highlight: "rgba(255, 255, 255, 0.4)",
  },
  eyes: { segment: 1, offset: 12, radius: 6.5, pupilRadius: 3.2 },
  followSpeed: 8.5,
  wanderSpeed: 3,
};
