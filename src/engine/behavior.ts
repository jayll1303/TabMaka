import type { Vec } from "./vec";
import { dist } from "./vec";

export type BehaviorState = "FOLLOWING" | "WANDERING" | "RESTING";

export interface BehaviorEnv {
  width: number;
  height: number;
}

export interface BehaviorOptions {
  /** ms after the pointer leaves before the creature starts wandering. */
  idleDelay?: number;
  /** ms of resting before picking a new wander target. */
  restDuration?: number;
  /** How close to a wander target counts as "arrived" (px). */
  arriveRadius?: number;
  now?: () => number;
  rand?: () => number;
}

/**
 * Decides where the creature's head wants to go.
 * - FOLLOWING: chase the cursor. Stays here as long as the pointer is present
 *   on the page, even if it is not moving.
 * - WANDERING: head to a random point, calmly (only when the pointer is away).
 * - RESTING: pause at the last point, then wander again.
 */
export class Behavior {
  state: BehaviorState = "RESTING";
  private target: Vec;
  private lastMouseAt: number;
  private restUntil = 0;
  private pointerPresent = false;
  private readonly idleDelay: number;
  private readonly restDuration: number;
  private readonly arriveRadius: number;
  private readonly now: () => number;
  private readonly rand: () => number;

  constructor(
    private env: BehaviorEnv,
    start: Vec,
    opts: BehaviorOptions = {},
  ) {
    this.target = { ...start };
    this.idleDelay = opts.idleDelay ?? 2500;
    this.restDuration = opts.restDuration ?? 1500;
    this.arriveRadius = opts.arriveRadius ?? 30;
    this.now = opts.now ?? (() => performance.now());
    this.rand = opts.rand ?? Math.random;
    this.lastMouseAt = this.now() - this.idleDelay - 1;
  }

  setEnv(env: BehaviorEnv): void {
    this.env = env;
  }

  /** Report whether the cursor is currently over the page. */
  setPointerPresent(present: boolean): void {
    this.pointerPresent = present;
    if (!present) {
      // Start the idle countdown from the moment the pointer leaves.
      this.lastMouseAt = this.now();
    }
  }

  /** Report mouse activity; wakes into FOLLOWING and tracks the cursor. */
  notifyMouse(pos: Vec): void {
    this.lastMouseAt = this.now();
    this.target = { ...pos };
    this.state = "FOLLOWING";
  }

  private randomPoint(): Vec {
    const margin = 80;
    return {
      x: margin + this.rand() * Math.max(1, this.env.width - margin * 2),
      y: margin + this.rand() * Math.max(1, this.env.height - margin * 2),
    };
  }

  /** Advance the FSM; returns the head target for this frame. */
  update(head: Vec): { target: Vec; state: BehaviorState } {
    const t = this.now();

    if (this.state === "FOLLOWING") {
      // Stay glued to the cursor while it is present, even if stationary.
      if (!this.pointerPresent && t - this.lastMouseAt > this.idleDelay) {
        this.state = "WANDERING";
        this.target = this.randomPoint();
      }
      return { target: this.target, state: this.state };
    }

    if (this.state === "WANDERING") {
      if (dist(head, this.target) <= this.arriveRadius) {
        this.state = "RESTING";
        this.restUntil = t + this.restDuration;
      }
      return { target: this.target, state: this.state };
    }

    // RESTING
    if (t >= this.restUntil) {
      this.state = "WANDERING";
      this.target = this.randomPoint();
    }
    return { target: this.target, state: this.state };
  }
}
