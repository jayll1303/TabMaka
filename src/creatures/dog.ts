import type { FaceConfig } from "./face-types";

export const dog: FaceConfig = {
  id: "dog",
  name: "Dog",
  kind: "face",
  size: 90,
  body: "dog",
  palette: {
    body: "#c8925a",
    outline: "#6e4a26",
    belly: "#f0d8bd",
    eye: "#ffffff",
    pupil: "#2a1a0e",
  },
  eye: {
    separation: 0.42,
    top: -0.15,
    radius: 0.3,
    pupil: 0.14,
    travel: 0.5,
  },
};
