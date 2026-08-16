export interface Palette {
  body: string;
  outline: string;
  belly: string;
  eye: string;
  pupil: string;
}

export interface EyeConfig {
  /** How far along the spine (segment index) the eyes sit. */
  segment: number;
  /** Sideways offset from the spine center, in px. */
  offset: number;
  /** Eye radius in px. */
  radius: number;
  /** Pupil radius in px. */
  pupilRadius: number;
}

export interface CreatureConfig {
  id: string;
  name: string;
  /** Number of spine joints, head first. */
  segmentCount: number;
  /** Fixed distance between adjacent joints, in px. */
  linkDistance: number;
  /**
   * Body radius per segment (index 0 = head). Length may be shorter than
   * segmentCount; missing values fall back to the last entry.
   */
  radii: number[];
  /** Max angle (radians) allowed between adjacent segments. */
  maxAngle: number;
  palette: Palette;
  eyes: EyeConfig;
  /** Speed (px/frame at 60fps) the head chases its target while following. */
  followSpeed: number;
  /** Speed while wandering (slower, calmer). */
  wanderSpeed: number;
}

/** Radius for a segment index, clamped to the defined profile. */
export function radiusAt(config: CreatureConfig, index: number): number {
  const { radii } = config;
  if (radii.length === 0) return 1;
  if (index < radii.length) return radii[index];
  return radii[radii.length - 1];
}
