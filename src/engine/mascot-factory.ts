import type { Mascot, Size } from "./mascot";
import { SpineMascot } from "./spine-mascot";
import { FaceMascot } from "./face-mascot";
import {
  mascotConfigs,
  defaultMascotId,
  isFaceConfig,
  type MascotConfig,
} from "../creatures/index";

/** Build the right Mascot implementation for a config id. */
export function createMascot(id: string, size: Size, reduced: boolean): Mascot {
  const config: MascotConfig = mascotConfigs[id] ?? mascotConfigs[defaultMascotId];
  if (isFaceConfig(config)) {
    return new FaceMascot(config, size);
  }
  return new SpineMascot(config, size, reduced);
}
