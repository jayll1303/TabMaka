import type { CreatureConfig } from "./types";
import { taperedProfile } from "./profile";

const SEGMENTS = 34;

/**
 * Long and lithe: thin, near-uniform body that tapers to a fine tail, with a
 * tighter angle limit so it slithers in smooth S-curves.
 */
export const snake: CreatureConfig = {
  id: "snake",
  name: "Snake",
  segmentCount: SEGMENTS,
  linkDistance: 14,
  radii: taperedProfile(SEGMENTS, { head: 12, peak: 14, peakFrac: 0.12, tail: 2 }),
  maxAngle: Math.PI / 7,
  palette: {
    body: "#6ab04c",
    outline: "#3d6b28",
    belly: "#c8f0a9",
    eye: "#fff7cc",
    pupil: "#1a1a1a",
  },
  eyes: { segment: 1, offset: 7, radius: 4.5, pupilRadius: 2 },
  followSpeed: 7.5,
  wanderSpeed: 2.2,
};
