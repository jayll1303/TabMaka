import type { Vec } from "./vec";
import { clamp, lerp } from "./vec";

export type FlyState = "buzzing" | "targeted" | "caught" | "eaten";
export type BugSpecies = "fly" | "ladybug" | "bee" | "firefly" | "dragonfly";

export const BUG_SPECIES: BugSpecies[] = [
  "fly",
  "ladybug",
  "bee",
  "firefly",
  "dragonfly",
];

function createImage(src: string): HTMLImageElement {
  if (typeof Image !== "undefined") {
    const img = new Image();
    img.src = src;
    return img;
  }
  return {
    src,
    complete: false,
    naturalWidth: 0,
    naturalHeight: 0,
  } as HTMLImageElement;
}

const bugSprites: Record<BugSpecies, HTMLImageElement> = {
  fly: createImage("./sprites/bugs/fly.svg"),
  ladybug: createImage("./sprites/bugs/ladybug.svg"),
  bee: createImage("./sprites/bugs/bee.svg"),
  firefly: createImage("./sprites/bugs/firefly.svg"),
  dragonfly: createImage("./sprites/bugs/dragonfly.svg"),
};

const bugSizes: Record<BugSpecies, number> = {
  fly: 26,
  ladybug: 25,
  bee: 28,
  firefly: 28,
  dragonfly: 32,
};

export class Fly {
  public pos: Vec;
  public anchor: Vec;
  public state: FlyState = "buzzing";
  public timer: number; // seconds remaining before tongue strike
  public species: BugSpecies;
  private time = 0;
  private wingsPhase = 0;

  constructor(targetPos: Vec, durationSeconds?: number, species?: BugSpecies) {
    this.anchor = { ...targetPos };
    this.pos = { ...targetPos };
    this.species =
      species ?? BUG_SPECIES[Math.floor(Math.random() * BUG_SPECIES.length)];
    // Random duration between 0.6s and 2.4s if not specified
    this.timer = durationSeconds ?? 0.6 + Math.random() * 1.8;
  }

  update(dtScale: number): void {
    if (this.state === "eaten") return;

    this.time += dtScale * 0.04;
    this.wingsPhase += dtScale * 0.55;

    if (this.state === "buzzing") {
      const dtSec = dtScale / 60;
      this.timer -= dtSec;

      // Gentle organic figure-8 flight wobble around anchor point
      const wobbleX =
        Math.sin(this.time * 2.8) * 18 + Math.cos(this.time * 5.6) * 6;
      const wobbleY =
        Math.cos(this.time * 2.2) * 14 + Math.sin(this.time * 4.4) * 5;

      const targetX = this.anchor.x + wobbleX;
      const targetY = this.anchor.y + wobbleY;

      this.pos.x = lerp(this.pos.x, targetX, clamp(0.15 * dtScale, 0, 1));
      this.pos.y = lerp(this.pos.y, targetY, clamp(0.15 * dtScale, 0, 1));

      if (this.timer <= 0) {
        this.state = "targeted";
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.state === "eaten") return;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    // Subtle flight wobble tilt
    const wobbleTilt =
      Math.sin(this.wingsPhase * 2.5) * 0.1 + Math.sin(this.time * 2.8) * 0.12;
    ctx.rotate(wobbleTilt);

    // Special luminous aura for firefly
    if (this.species === "firefly") {
      const glowR = 16 + Math.sin(this.time * 6) * 4;
      const grad = ctx.createRadialGradient(0, 4, 1, 0, 4, glowR);
      grad.addColorStop(0, "rgba(255, 245, 120, 0.8)");
      grad.addColorStop(0.5, "rgba(186, 220, 88, 0.35)");
      grad.addColorStop(1, "rgba(186, 220, 88, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 4, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dynamic wing flap pulsation
    const flap = 1.0 + Math.sin(this.wingsPhase * 4) * 0.08;
    ctx.scale(flap, 1 / flap);

    // Render SVG sprite
    const img = bugSprites[this.species];
    const sz = bugSizes[this.species];
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -sz / 2, -sz / 2, sz, sz);
    }

    ctx.restore();
  }
}
