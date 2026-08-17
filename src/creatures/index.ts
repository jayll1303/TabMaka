import type { CreatureConfig } from "./types";
import type { FaceConfig } from "./face-types";
import { tadpole } from "./tadpole";
import { frog } from "./frog";

export type MascotConfig = CreatureConfig | FaceConfig;

/** True when a config describes a stationary face mascot. */
export function isFaceConfig(c: MascotConfig): c is FaceConfig {
  return (c as FaceConfig).kind === "face";
}

/** All available mascots, keyed by id. */
export const mascotConfigs: Record<string, MascotConfig> = {
  tadpole,
  frog,
};

/** Stable display order for the picker. */
export const mascotList: MascotConfig[] = [
  tadpole,
  frog,
];

export const defaultMascotId = "tadpole";

export type { CreatureConfig, FaceConfig };
