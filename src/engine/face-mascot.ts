import type { FaceConfig } from "../creatures/face-types";
import { type Vec, clamp, lerp, normalize, sub, len } from "./vec";
import { Blink } from "./blink";
import type { Mascot, Size } from "./mascot";

/**
 * Stationary character whose pupils track the cursor. The body is drawn from a
 * small set of primitives so dog/frog silhouettes share one renderer.
 */
export class FaceMascot implements Mascot {
  private cursor: Vec;
  private present = false;
  private center: Vec;
  private readonly blink = new Blink();
  // Smoothed pupil offset per eye (shared, since both look the same way).
  private look: Vec = { x: 0, y: 0 };
  private desired: Vec = { x: 0, y: 0 };

  constructor(
    private config: FaceConfig,
    size: Size,
  ) {
    this.center = { x: size.w / 2, y: size.h / 2 };
    this.cursor = { ...this.center };
  }

  setCursor(pos: Vec): void {
    this.present = true;
    this.cursor = pos;
  }

  setPointerPresent(present: boolean): void {
    this.present = present;
  }

  setEnv(size: Size): void {
    this.center = { x: size.w / 2, y: size.h / 2 };
  }

  update(dtScale: number, reduced: boolean): void {
    // Desired look direction: toward the cursor, or centered when away.
    let desired: Vec = { x: 0, y: 0 };
    if (this.present) {
      const to = sub(this.cursor, this.center);
      const d = len(to);
      if (d > 1) {
        const dir = normalize(to);
        // Saturate: pupils reach full travel a bit before the screen edge.
        const reach = clamp(d / (this.config.size * 4), 0, 1);
        desired = { x: dir.x * reach, y: dir.y * reach };
      }
    }
    this.desired = desired;
    const t = reduced ? 1 : clamp(0.2 * dtScale, 0, 1);
    this.look = {
      x: lerp(this.look.x, desired.x, t),
      y: lerp(this.look.y, desired.y, t),
    };
    if (!reduced) this.blink.update(dtScale);
  }

  draw(ctx: CanvasRenderingContext2D, _size: Size): void {
    void _size;
    const { palette, size, body } = this.config;
    const cx = this.center.x;
    const cy = this.center.y;

    if (body === "dog") this.drawDogBody(ctx, cx, cy, size, palette);
    else this.drawFrogBody(ctx, cx, cy, size, palette);

    this.drawEyes(ctx, cx, cy);
  }

  isSettled(): boolean {
    // Settled when the pupils have essentially reached their look target.
    return (
      Math.abs(this.look.x - this.desired.x) < 0.01 &&
      Math.abs(this.look.y - this.desired.y) < 0.01
    );
  }

  private drawDogBody(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    s: number,
    palette: FaceConfig["palette"],
  ): void {
    ctx.lineWidth = 3;
    ctx.strokeStyle = palette.outline;
    // Ears (drawn first, behind the head).
    ctx.fillStyle = palette.outline;
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + dir * s * 0.85, cy - s * 0.1, s * 0.28, s * 0.6, dir * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Head.
    ctx.beginPath();
    ctx.ellipse(cx, cy, s, s * 0.9, 0, 0, Math.PI * 2);
    ctx.fillStyle = palette.body;
    ctx.fill();
    ctx.stroke();
    // Snout.
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.45, s * 0.5, s * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = palette.belly;
    ctx.fill();
    ctx.stroke();
    // Nose.
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.32, s * 0.13, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = palette.pupil;
    ctx.fill();
  }

  private drawFrogBody(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    s: number,
    palette: FaceConfig["palette"],
  ): void {
    ctx.lineWidth = 3;
    ctx.strokeStyle = palette.outline;
    // Body.
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.2, s * 1.05, s * 0.85, 0, 0, Math.PI * 2);
    ctx.fillStyle = palette.body;
    ctx.fill();
    ctx.stroke();
    // Cheeks / belly.
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.55, s * 0.6, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = palette.belly;
    ctx.fill();
    // Mouth (simple arc).
    ctx.beginPath();
    ctx.arc(cx, cy + s * 0.2, s * 0.5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.strokeStyle = palette.outline;
    ctx.stroke();
  }

  private drawEyes(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
  ): void {
    const { eye, size, palette } = this.config;
    const sep = size * eye.separation;
    const top = cy + size * eye.top;
    const rWhite = size * eye.radius;
    const rPupil = size * eye.pupil;
    const maxTravel = rWhite * eye.travel;
    const eyeOpen = this.blink.currentOpen();

    for (const dir of [-1, 1]) {
      const ex = cx + dir * sep;
      const ey = top;
      // White.
      ctx.beginPath();
      ctx.ellipse(ex, ey, rWhite, rWhite * eyeOpen, 0, 0, Math.PI * 2);
      ctx.fillStyle = palette.eye;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = palette.outline;
      ctx.stroke();
      // Pupil.
      if (eyeOpen > 0.35) {
        const px = ex + this.look.x * maxTravel;
        const py = ey + this.look.y * maxTravel * eyeOpen;
        ctx.beginPath();
        ctx.arc(px, py, rPupil, 0, Math.PI * 2);
        ctx.fillStyle = palette.pupil;
        ctx.fill();
      }
    }
  }
}

