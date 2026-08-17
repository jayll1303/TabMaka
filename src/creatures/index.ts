import type { CreatureConfig } from "./types";
import type { FaceConfig } from "./face-types";
import { frog } from "./frog";

export type MascotConfig = CreatureConfig | FaceConfig;

/** True when a config describes a stationary face mascot. */
export function isFaceConfig(c: MascotConfig): c is FaceConfig {
  return (c as FaceConfig).kind === "face";
}

/** All available mascots, keyed by id. */
export const mascotConfigs: Record<string, MascotConfig> = {
  frog,
};

/** Stable display order for the picker. */
export const mascotList: MascotConfig[] = [
  frog,
];

export const defaultMascotId = "frog";

export type { CreatureConfig, FaceConfig };
