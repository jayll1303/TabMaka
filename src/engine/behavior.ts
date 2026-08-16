import type { Vec } from "./vec";
import { dist } from "./vec";

export type BehaviorState = "FOLLOWING" | "WANDERING" | "RESTING";

export interface BehaviorEnv {
  width: number;
  height: number;
}

export interface BehaviorOptions {
  /** ms without mouse input before leaving FOLLOWING. */
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
 * - FOLLOWING: chase the mouse.
 * - WANDERING: head to a random point, calmly.
 * - RESTING: pause at the last point, then wander again.
 * Any mouse movement wakes it back to FOLLOWING.
 */
export class Behavior {
  state: BehaviorState = "RESTING";
  private target: Vec;
  private lastMouseAt: number;
  private restUntil = 0;
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

  /** Report mouse activity; wakes into FOLLOWING. */
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
      if (t - this.lastMouseAt > this.idleDelay) {
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
