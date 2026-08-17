import type { FaceConfig } from "./face-types";

/**
 * Exact Kawaii Frog Loaf (Doodle Sticker Style from user reference image):
 * - Chunky avocado green body (#7eb94f)
 * - Thick black cartoon outline (#111111)
 * - Signature 2-bump head (front eye dome & rear eye dome)
 * - Solid black bead eye with subtle cursor tracking
 * - Squiggly :3 / w mouth
 * - 2 front stubby legs with arch gap
 * - Dark olive green fold/shadow markings (#66993e)
 */
export const frog: FaceConfig = {
  id: "frog",
  name: "Frog",
  kind: "face",
  size: 110,
  body: "frog",
  palette: {
    body: "#82c355",
    outline: "#121212",
    belly: "#679d3f", // used for shadow / crease patches
    eye: "#121212",
    pupil: "#ffffff",
    blush: "rgba(255, 140, 150, 0.4)",
    fin: "#679d3f",
    highlight: "#ffffff",
  },
  eye: {
    separation: 0,
    top: -0.32,
    radius: 0.19,
    pupil: 0.08,
    travel: 0.35,
  },
};
