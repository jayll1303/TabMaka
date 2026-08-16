import type { CreatureConfig } from "./types";
import type { FaceConfig } from "./face-types";
import { eel } from "./eel";
import { fish } from "./fish";
import { snake } from "./snake";
import { tadpole } from "./tadpole";
import { dog } from "./dog";
import { frog } from "./frog";

export type MascotConfig = CreatureConfig | FaceConfig;

/** True when a config describes a stationary face mascot. */
export function isFaceConfig(c: MascotConfig): c is FaceConfig {
  return (c as FaceConfig).kind === "face";
}

/** All available mascots, keyed by id. */
export const mascotConfigs: Record<string, MascotConfig> = {
  eel,
  fish,
  snake,
  tadpole,
  dog,
  frog,
};

/** Stable display order for the picker. */
export const mascotList: MascotConfig[] = [
  eel,
  fish,
  snake,
  tadpole,
  dog,
  frog,
];

export const defaultMascotId = "eel";

export type { CreatureConfig, FaceConfig };
