import type { FaceConfig } from "./face-types";

export const frog: FaceConfig = {
  id: "frog",
  name: "Frog",
  kind: "face",
  size: 90,
  body: "frog",
  palette: {
    body: "#6ab04c",
    outline: "#3d6b28",
    belly: "#d6f0b8",
    eye: "#ffffff",
    pupil: "#1a1a1a",
  },
  eye: {
    // Frog eyes sit high and wide, like bulging domes on top of the head.
    separation: 0.55,
    top: -0.62,
    radius: 0.34,
    pupil: 0.15,
    travel: 0.55,
  },
};
