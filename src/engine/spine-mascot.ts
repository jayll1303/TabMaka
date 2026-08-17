import type { CreatureConfig } from "../creatures/types";
import { createSpine, resolveSpine, type Spine } from "./spine";
import { drawCreature } from "./render";
import { stepToward } from "./locomotion";
import { Blink } from "./blink";
import { Behavior } from "./behavior";
import { type Vec, dist } from "./vec";
import type { Mascot, Size } from "./mascot";

/**
 * A moving spine creature (e.g. tadpole). The head chases the
 * cursor while present and wanders when the cursor leaves.
 */
export class SpineMascot implements Mascot {
  private spine: Spine;
  private head: Vec;
  private readonly blink = new Blink();
  private readonly behavior: Behavior;
  private target: Vec;

  constructor(
    private config: CreatureConfig,
    size: Size,
    reduced: boolean,
  ) {
    const center = { x: size.w / 2, y: size.h / 2 };
    this.spine = createSpine(config, center);
    this.head = { ...center };
    this.target = { ...center };
    this.behavior = new Behavior({ width: size.w, height: size.h }, center);
    this.behavior.state = reduced ? "RESTING" : "WANDERING";
    resolveSpine(this.spine, this.head);
  }

  setCursor(pos: Vec): void {
    this.behavior.setPointerPresent(true);
    this.behavior.notifyMouse(pos);
  }

  setPointerPresent(present: boolean): void {
    this.behavior.setPointerPresent(present);
  }

  setEnv(size: Size): void {
    this.behavior.setEnv({ width: size.w, height: size.h });
  }

  update(dtScale: number, reduced: boolean): void {
    const { target, state } = this.behavior.update(this.head);
    this.target = target;
    const speed =
      state === "FOLLOWING" ? this.config.followSpeed : this.config.wanderSpeed;
    this.head = stepToward(this.head, target, speed, dtScale);
    resolveSpine(this.spine, this.head);
    if (!reduced) this.blink.update(dtScale);
  }

  draw(ctx: CanvasRenderingContext2D, _size: Size): void {
    void _size;
    const eyeOpen = this.blink.currentOpen();
    drawCreature(ctx, this.spine, this.config, this.target, eyeOpen);
  }

  isSettled(): boolean {
    return dist(this.head, this.target) < 0.5;
  }
}
