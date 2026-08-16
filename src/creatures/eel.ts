import type { CreatureConfig } from "./types";
import { taperedProfile } from "./profile";

const SEGMENTS = 28;

export const eel: CreatureConfig = {
  id: "eel",
  name: "Eel",
  segmentCount: SEGMENTS,
  linkDistance: 16,
  radii: taperedProfile(SEGMENTS, { head: 10, peak: 22, peakFrac: 0.18, tail: 3 }),
  maxAngle: Math.PI / 8,
  palette: {
    body: "#5b8dd9",
    outline: "#2f4d80",
    belly: "#a9c8f0",
    eye: "#ffffff",
    pupil: "#12203a",
  },
  eyes: { segment: 1, offset: 9, radius: 5, pupilRadius: 2.4 },
  followSpeed: 7,
  wanderSpeed: 2.4,
};
