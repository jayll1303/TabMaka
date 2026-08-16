import type { CreatureConfig } from "./types";
import { taperedProfile } from "./profile";

const SEGMENTS = 16;

/**
 * Big round head, rapidly thinning wiggly tail. Reads as a friendly tadpole.
 */
export const tadpole: CreatureConfig = {
  id: "tadpole",
  name: "Tadpole",
  segmentCount: SEGMENTS,
  linkDistance: 13,
  radii: taperedProfile(SEGMENTS, { head: 26, peak: 28, peakFrac: 0.05, tail: 2 }),
  maxAngle: Math.PI / 5,
  palette: {
    body: "#9b59b6",
    outline: "#6a3182",
    belly: "#e0b6ee",
    eye: "#ffffff",
    pupil: "#241030",
  },
  eyes: { segment: 1, offset: 11, radius: 6, pupilRadius: 3 },
  followSpeed: 8.5,
  wanderSpeed: 3,
};
