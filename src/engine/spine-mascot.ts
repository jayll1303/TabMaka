import type { CreatureConfig } from "../creatures/types";
import { createSpine, resolveSpine, type Spine } from "./spine";
import { drawCreature } from "./render";
import { stepToward } from "./locomotion";
import { Blink } from "./blink";
import { Behavior } from "./behavior";
import { type Vec, dist, sub } from "./vec";
import type { Mascot, Size } from "./mascot";
import { ParticleSystem } from "./particles";

/**
 * A moving spine creature (e.g. tadpole). The head chases the
 * cursor while present and wanders when the cursor leaves.
 */
export class SpineMascot implements Mascot {
  private spine: Spine;
  private head: Vec;
  private readonly blink = new Blink();
  private readonly behavior: Behavior;
  private readonly particles = new ParticleSystem();
  private target: Vec;
  private bubbleTimer = 0;

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
    const prevHead = { ...this.head };
    this.head = stepToward(this.head, target, speed, dtScale);
    resolveSpine(this.spine, this.head);

    if (!reduced) {
      this.blink.update(dtScale);

      // Emit swimming bubble trail
      const moved = dist(prevHead, this.head);
      if (moved > 0.4) {
        this.bubbleTimer += dtScale * (state === "FOLLOWING" ? 1.5 : 0.8);
        if (this.bubbleTimer >= 5) {
          this.bubbleTimer = 0;
          const lastIdx = this.spine.joints.length - 1;
          const tailJoint = this.spine.joints[lastIdx];
          const prevJoint = this.spine.joints[Math.max(0, lastIdx - 2)];
          const drift = sub(tailJoint, prevJoint);
          this.particles.emit(tailJoint, drift);
        }
      }

      this.particles.update(dtScale);
    }
  }

  draw(ctx: CanvasRenderingContext2D, _size: Size): void {
    void _size;
    // 1. Draw swimming water bubbles
    this.particles.draw(ctx);

    // 2. Draw creature
    const eyeOpen = this.blink.currentOpen();
    drawCreature(ctx, this.spine, this.config, this.target, eyeOpen);
  }

  isSettled(): boolean {
    return dist(this.head, this.target) < 0.5;
  }
}
