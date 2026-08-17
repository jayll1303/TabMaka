import type { Palette } from "../creatures/types";

/**
 * A stationary character (frog) drawn as a simple body with two large
 * round eyes whose pupils track the cursor. No spine, no locomotion.
 */
export interface FaceConfig {
  id: string;
  name: string;
  kind: "face";
  /** Overall scale in px (body radius baseline). */
  size: number;
  /** Body silhouette. */
  body: "frog";
  palette: Palette;
  /** Eye layout, relative to body center (fractions of `size`). */
  eye: {
    /** Horizontal separation of the two eyes (fraction of size). */
    separation: number;
    /** Vertical position of eyes (fraction of size; negative = up). */
    top: number;
    /** White radius (fraction of size). */
    radius: number;
    /** Pupil radius (fraction of size). */
    pupil: number;
    /** Max pupil travel from eye center (fraction of eye radius). */
    travel: number;
  };
}
