import type { CreatureConfig } from "./types";
import { eel } from "./eel";
import { fish } from "./fish";
import { snake } from "./snake";
import { tadpole } from "./tadpole";

/** All available mascots, keyed by id. */
export const creatures: Record<string, CreatureConfig> = {
  eel,
  fish,
  snake,
  tadpole,
};

/** Stable display order for the picker. */
export const creatureList: CreatureConfig[] = [eel, fish, snake, tadpole];

export const defaultCreatureId = "eel";

export type { CreatureConfig };
